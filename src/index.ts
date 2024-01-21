import type {CustomAction, CustomEvent, Frame, Item, Shape} from "@mirohq/websdk-types";
import {checkIfRegionShouldBeHidden, createRegion, hideRegion, isShapeInsideViewport, showRegion} from "./logic";
import {getGlobalCoordinates} from "./utils";

import {convert} from "html-to-text";
import {generateChatCompletion} from "./ai";

async function generateCollectiveTitle(items: Item[]): Promise<string> {
    const itemTexts = items.flatMap(item => "content" in item ? convert(item.content) as string : [])
    const itemTextsMerged = "\n" + itemTexts.join("\n")
    const completion = await generateChatCompletion([
            {
                role: "system",
                content: "Give a short (at most 3 words) title for the items the users mentions. Do not use punctuation"
            },
            {role: "user", content: itemTextsMerged}
        ],
    );

    return completion? completion.choices[0].message!.content! : "notes";
}

async function findBoundingBox(items: Item[]) {
    const boundingBoxesInitial = await Promise.all(items.map(async item => {
        if (!("x" in item)) {
            return Promise.resolve([]);
        }

        const coordinates = await getGlobalCoordinates(item);
        console.log("coord: ", coordinates, item.x, item.y);
        return {
            minX: coordinates.x - item.width! / 2,
            maxX: coordinates.x + item.width! / 2,
            minY: coordinates.y - item.height! / 2,
            maxY: coordinates.y + item.height! / 2,
        }
    }));
    const boundingBoxes = boundingBoxesInitial.flat();

    return {
        minX: Math.min.apply(null, boundingBoxes.map(item => item.minX)),
        maxX: Math.max.apply(null, boundingBoxes.map(item => item.maxX)),
        minY: Math.min.apply(null, boundingBoxes.map(item => item.minY)),
        maxY: Math.max.apply(null, boundingBoxes.map(item => item.maxY)),
    }
}

const handleCreateRegion = async (event: CustomEvent) => {
    let items = event.items;

    if (items.length == 0) return;

    if (items[0].type == "frame") {
        await createRegion(items[0] as Frame);
        return;
    }

    const box = await findBoundingBox(items)

    const frameTitle = await generateCollectiveTitle(items)

    const frame = await miro.board.createFrame({
        x: (box.minX + box.maxX) / 2,
        y: (box.minY + box.maxY) / 2,
        height: Math.max(100, box.maxY - box.minY), // widgets can be less than 100, but not frames
        width: Math.max(100, box.maxX - box.minX),
        title: frameTitle,
    })

    await createRegion(frame);
}

export async function init() {
    miro.board.ui.on('icon:click', async () => {
        await miro.board.ui.openPanel({url: 'app.html'});
    });

    await miro.board.ui.on(
        "custom:create-region",
        handleCreateRegion
    );

    const createRegionAction: CustomAction = {
        event: "create-region",
        ui: {
            label: {
                en: "Create a region",
            },
            icon: "keycap",
            description: {
                en: "Create a region using the current selection",
            },
            position: 1,
        },
        predicate: {
            $or: [{type: "frame"}, {type: "sticky_note"}, {type: "text"}, {type: "shape"},
                {type: "connector"}, {type: "card"}, {type: "image"}, {type: "app_card"},
                {type: "embed"}, {type: "mindmap_node"}, {type: "preview"}],
        }
    };

    await miro.board.experimental.action.register(createRegionAction);
}

export async function poll() {
    console.log('init')

    const storage = miro.board.storage.collection('storage')
    let regions = await storage.get('regions')
    console.log(regions)

    // if (!regions) {
    //   const frame = await miro.board.createFrame({
    //     x: -10000,
    //     y: 2000,
    //     width: 1000,
    //     height: 1000
    //   })
    //   await createRegion(frame)
    // }

  for (let i = 0; i < 1e12; i++) {
    await new Promise((r) => setTimeout(r, 150))

        // check the zoom and correct state of all regions here

        const viewport = await miro.board.viewport.get();

        let regions = await storage.get('regions')
        console.log(regions)

        if (!regions) {
            // no regions
            continue
        }
        regions = regions as Array<string>

        let regionsToRemove: string[] = []

    const nodes= await miro.board.get(
        {'id': [...regions.map(c => c!['id']), ...regions.map(c => c!['frameId'])], 'type': ['shape', 'frame']})
    let frameI = nodes.findIndex(node => node.type === 'frame')
    let regionI = 0

    for (let region_obj of regions) {
      const regionId = region_obj!['id']
      const frameId = region_obj!['frameId']
      console.log('region id', regionId)

      if (nodes.length < 2) {
        console.log('region disappeared')
        regionsToRemove.push(regionId)
        continue
        // region does not exist anymore
        // todo delete region from the list
      }
      const region = nodes.find(node => node.id === regionId) as Shape
      const frame= nodes.find(node => node.id === frameId) as Frame

      if (!region || !frame) {
        continue
      }

        const hidden = region.width < 101 && region.height < 101

        // console.log(isShapeInsideViewport(frame, viewport))
        if (!isShapeInsideViewport(frame, viewport)) {
          continue
        }

        const shouldBeHidden = await checkIfRegionShouldBeHidden(frame, viewport)
        if (shouldBeHidden && !hidden) {
          console.log('hide', regionId)
          await hideRegion(region);
        } else if (!shouldBeHidden && hidden) {
          console.log('show', regionId);
          await showRegion(region);
        }

    }
    if (regionsToRemove.length > 0) {
      regions = regions.filter(v => !regionsToRemove.includes(v!['id']));
      await storage.set('regions', regions);
    }
  }
}


init();

poll();
