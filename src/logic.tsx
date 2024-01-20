// import * as React from 'react';

async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

async function createCurtain(
        frameX:int,
        frameY:int,
        frameHeight:int,
        frameWidth:int,
        curtainColor:string='#ffff00',
        textColor:string='#ff0000') {
    return await miro.board.createShape({
        content: '<p>Summary of whatever is inside here</p>',
        shape: 'rectangle',
        style: {
            color: curtainColor, // Default text color: '#1a1a1a' (black)
            fillColor: textColor, // Default shape fill color: transparent (no fill)
            fontFamily: 'arial', // Default font type for the text
            fontSize: 50, // Default font size for the text, in dp
            textAlign: 'center', // Default horizontal alignment for the text
            textAlignVertical: 'middle', // Default vertical alignment for the text
            borderStyle: 'normal', // Default border line style
            borderOpacity: 1.0, // Default border color opacity: no opacity
            borderColor: '#ff7400', // Default border color: '#ffffff` (white)
            borderWidth: 2, // Default border width
            fillOpacity: 1.0, // Default fill color opacity: no opacity
        },
        x: frameX, // Default value: center of the board
        y: frameY, // Default value: center of the board
        width: frameWidth,
        height: frameHeight
    });
}

async function showCurtain(id: int) {
    return id
}

async function hideCurtain(id) {

}


export {addSticky, showCurtain, hideCurtain, createCurtain}

