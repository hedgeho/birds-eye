
import type {CustomAction, CustomEvent, Frame} from "@mirohq/websdk-types";
import {createCurtain} from "./logic";

const createCurtainHandler = async (event: CustomEvent)=> {
    console.log("Create curtain:\n: " + event)
    let items = event.items;

    if (items.length == 0) return;

    let frame = items[0] as Frame;

    if (frame.title === undefined) {
      let xs = items.flatMap(item => "x" in item? item.x : []);
      let ys = items.flatMap(item => "y" in item? item.y : []);
      let minX = Math.min.apply(null, xs);
      let maxX = Math.max.apply(null, xs);
      let minY = Math.min.apply(null, ys);
      let maxY = Math.max.apply(null, ys);

      // TODO: add frame title
      frame = await miro.board.createFrame({
        x: minX,
        y: minY,
        height: maxY - minY,
        width: maxX - minX,
      })
    }

    let curtain = await createCurtain(frame.x, frame.y, frame.height, frame.width, frame.title);
    await frame.add(curtain);
    await frame.sendBehindOf(frame);
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
        // TODO: handle curtains for selections
      ],
    },
  };

  await miro.board.experimental.action.register(createCurtainAction);
}

export async function poll() {
  for (let i = 0; i < 1e12; i++) {
    await new Promise((r) => setTimeout(r, 10))

    // check the zoom and correct state of all curtains here
  }
}


init();

poll();
