
import type {CustomAction, CustomEvent, Frame, Item, Shape} from "@mirohq/websdk-types";
import {checkIfCurtainShouldBeHidden, createCurtain, hideCurtain, showCurtain} from "./logic";

import {OpenAIClient, AzureKeyCredential} from "@azure/openai";
import {convert} from "html-to-text";

type PositionedItem = {
  x: number,
  y: number,
} & Item;

const getGlobalCoordinates = async (item: PositionedItem): Promise<{x:number, y:number}> => {
  var x = item.x;
  var y = item.y;

  if (item.parentId) {
    let parent = await miro.board.getById(item.parentId);
    if (parent && "x" in parent) {
      let offset = await getGlobalCoordinates(parent);
      x += offset.x - parent.width!/2;
      y += offset.y - parent.height!/2;
    }
  }
  return {x, y};
};

const createCurtainHandler = async (event: CustomEvent)=> {
    let items = event.items;

    if (items.length == 0) return;

    let frame = items[0] as Frame;
    if (frame.title !== undefined){
      await createCurtain(frame);
      return;
    }

    let boundingBoxesInitial = await Promise.all(items.map(async item => {
      if (!("x" in item)){
        return Promise.resolve([]);
      }

      let coordinates = await getGlobalCoordinates(item);
      console.log("coord: ", coordinates, item.x, item.y);
      return {
        minX: coordinates.x - item.width! / 2,
        maxX: coordinates.x + item.width! / 2,
        minY: coordinates.y - item.height! / 2,
        maxY: coordinates.y + item.height! / 2,
      }
    }));
    let boundingBoxes = boundingBoxesInitial.flat();

    let minX = Math.min.apply(null, boundingBoxes.map(item => item.minX));
    let maxX = Math.max.apply(null, boundingBoxes.map(item => item.maxX));
    let minY = Math.min.apply(null, boundingBoxes.map(item => item.minY));
    let maxY = Math.max.apply(null, boundingBoxes.map(item => item.maxY));

    const openai = new OpenAIClient(
        "https://dataguild-openai.openai.azure.com/",
        new AzureKeyCredential(import.meta.env.VITE_OPENAI_API_KEY!),
        {
          apiVersion: "2023-07-01-preview",
        }
    );

    let itemTexts = items.flatMap(item => "content" in item? convert(item.content) as string : [])
    let itemTextsMerged = "\n" + itemTexts.join("\n")
    // console.log("Summarize the following items in less than 3 words in total: " + itemTextsMerged)
    // console.log(prompt);
    const completion = await openai.getChatCompletions("deployment", [
        {role: "system", content: "Give a shot (at most in 3 words) title the items the users mentions. Do not use punctuation"},
        {role: "user", content: itemTextsMerged}
        ],
    );

    frame = await miro.board.createFrame({
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      height: Math.max(100, maxY - minY), // widgets can be less than 100, but not frames
      width: Math.max(100, maxX - minX),
      title: completion.choices[0].message!.content!,
    })

    await createCurtain(frame);
}

export async function init() {
  miro.board.ui.on('icon:click', async () => {
    await miro.board.ui.openPanel({url: 'app.html'});
  });

  await miro.board.ui.on(
      "custom:create-curtain",
      createCurtainHandler
  );

  const createCurtainAction: CustomAction = {
    event: "create-curtain",
    ui: {
      label: {
        en: "Create a curtain",
      },
      icon: "stack",
      description: {
        en: "Create a curtain using the current selection",
      },
      position: 1,
    },
    predicate: {
      $or: [
        {
          type: "frame",
        },
        {
          type: "sticky_note",
        },
        {
          type: "text",
        },
        {
          type: "shape",
        },
        {
          type: "connector",
        },
        {
          type: "card",
        },
        {
          type: "app_card",
        },
      ],
    }
  };

  await miro.board.experimental.action.register(createCurtainAction);
}

export async function poll() {
  console.log('init')

  const storage = miro.board.storage.collection('storage')
  let curtains = await storage.get('curtains')
  console.log(curtains)

  // if (!curtains) {
  //   const frame = await miro.board.createFrame({
  //     x: -10000,
  //     y: 2000,
  //     width: 1000,
  //     height: 1000
  //   })
  //   await createCurtain(frame)
  // }

  for (let i = 0; i < 1e12; i++) {
    await new Promise((r) => setTimeout(r, 1000))

    // check the zoom and correct state of all curtains here

    const viewport = await miro.board.viewport.get();

    let curtains = await storage.get('curtains')
    console.log(curtains)

    if (!curtains) {
      // no curtains
      continue
    }
    curtains = curtains as Array<string>

    let curtainsToRemove: string[] = []

    for (let curtain_obj of curtains) {
      const curtainId = curtain_obj!['id']
      const frameId = curtain_obj!['frameId']
      console.log('curtain id', curtainId)
      const nodes = await miro.board.get({'id': [curtainId, frameId], 'type': ['shape', 'frame']})
      console.log(nodes)
      if (nodes.length < 2) {
        console.log('curtain disappeared')
        curtainsToRemove.push(curtainId)
        continue
        // curtain does not exist anymore
        // todo delete curtain from the list
      }
      const curtain = nodes[0] as Shape
      const frame= nodes[1] as Frame

      const hidden= curtain.width < 101 && curtain.height < 101

      // if (!isShapeInsideViewport(frame, viewport)) {
      //   continue
      // }

      const shouldBeHidden= await checkIfCurtainShouldBeHidden(frame, viewport)
      if (shouldBeHidden && !hidden) {
        console.log('hide', curtainId)
        await hideCurtain(curtain);
      } else if(!shouldBeHidden && hidden) {
        console.log('show', curtainId);
        await showCurtain(curtain);
      }
    }
    if (curtainsToRemove.length > 0) {
      curtains = curtains.filter(v => !curtainsToRemove.includes(v!['id']));
      await storage.set('curtains', curtains);
    }
  }
}


init();

poll();
