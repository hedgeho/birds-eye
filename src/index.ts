
import type {CustomAction, CustomEvent, Frame} from "@mirohq/websdk-types";
import {createCurtain} from "./logic";

const createCurtainHandler = async (event: CustomEvent)=> {
    console.log("Create curtain:\n: " + event)
    let frame = event.items[0] as Frame;
    // TODO: pass frame title
    await createCurtain(frame.x, frame.y, frame.height, frame.width);
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


init();
