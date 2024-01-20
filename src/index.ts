
import type {CustomAction, CustomEvent, Frame} from "@mirohq/websdk-types";
import {checkIfCurtainShouldBeHidden, createCurtain, hideCurtain, showCurtain} from "./logic";

const createCurtainHandler = async (event: CustomEvent)=> {
    let items = event.items;

    if (items.length == 0) return;

    let frame = items[0] as Frame;

    if (frame.title === undefined) {
      let minX = Math.min.apply(null, items.flatMap(item => "x" in item? item.x - item.width! / 2 : []));
      let maxX = Math.max.apply(null, items.flatMap(item => "x" in item? item.x + item.width! / 2 : []));
      let minY = Math.min.apply(null, items.flatMap(item => "y" in item? item.y - item.height! / 2: []));
      let maxY = Math.max.apply(null, items.flatMap(item => "y" in item? item.y + item.height! / 2: []));

      frame = await miro.board.createFrame({
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        height: Math.max(100, maxY - minY), // widgets can be less than 100, but not frames
        width: Math.max(100, maxX - minX),
      })
    }

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
  };

  await miro.board.experimental.action.register(createCurtainAction);
}

export async function poll() {
  const frame = await miro.board.createFrame({
    x: 1000,
    y: 2000,
    width: 1000,
    height: 1000
  })
  const curtain = await createCurtain(frame)
  for (let i = 0; i < 1e12; i++) {
    await new Promise((r) => setTimeout(r, 10))

    // check the zoom and correct state of all curtains here

    const viewport = await miro.board.viewport.get();

    const flag = await checkIfCurtainShouldBeHidden(curtain, viewport.height, viewport.width)
    if (flag) {
      console.log('hide')
      await hideCurtain(curtain);
    } else {
      console.log('show')
      await showCurtain(curtain);
    }
  }
}


init();

poll();
