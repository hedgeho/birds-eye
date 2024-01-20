// import * as React from 'react';

async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

async function createCurtain(
        frameX:number,
        frameY:number,
        frameHeight:number,
        frameWidth:number,
        title:string,
        fontsize:number=50,
        curtainColor:string='#2f00ff',
        textColor:string='#ffffff') {
    return await miro.board.createShape({
        content: '<p>' + title + '</p>',
        shape: 'rectangle',
        style: {
            color: textColor, // Default text color: '#1a1a1a' (black)
            fillColor: curtainColor, // Default shape fill color: transparent (no fill)
            fontFamily: 'arial', // Default font type for the text
            fontSize: fontsize, // Default font size for the text, in dp
            textAlign: 'center', // Default horizontal alignment for the text
            textAlignVertical: 'middle', // Default vertical alignment for the text
            borderStyle: 'normal', // Default border line style
            borderOpacity: 1.0, // Default border color opacity: no opacity
            borderColor: curtainColor, // Default border color: '#ffffff` (white)
            borderWidth: 0, // Default border width
            fillOpacity: 1.0, // Default fill color opacity: no opacity
        },
        x: frameX,
        y: frameY,
        width: frameWidth,
        height: frameHeight
    });
}

async function showCurtain(id: number) {
    return id;
}


// https://miro.com/app/board/uXjVN6tGqpU=/?moveToWidget=3458764576258626775&cot=14

async function hideCurtain(id: number) {
    return id;
}


export {addSticky, showCurtain, hideCurtain, createCurtain}

