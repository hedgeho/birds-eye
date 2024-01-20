// import * as React from 'react';

async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000,
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

async function showCurtain(id) {

}

async function hideCurtain(id) {

}


export {addSticky, showCurtain, hideCurtain}