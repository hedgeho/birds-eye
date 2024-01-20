// import * as React from 'react';

import {Frame, Shape} from "@mirohq/websdk-types";

export async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

// todo    function to be run for each curtain -> if curtain has to be hidden based on viewport

async function checkIfCurtainShouldBeHidden(curtain:Shape,viewPortHeight:number,viewPortWidth:number)
{
    return curtain.width * curtain.height <= viewPortWidth * viewPortHeight * 10;
}

export async function createCurtain(
    frame:Frame,
    fontsize:number=50,
    curtainColor:string='#2f00ff',
    textColor:string='#ffffff') {
    const curtain = await miro.board.createShape({
        content: '<p>' + frame.title + '</p>',
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
        x: frame.x,
        y: frame.y,
        width: frame.width,//frameWidth,
        height: frame.height//frameHeight
    });

    await frame.add(curtain)
    // await hideCurtain(curtain)
    return curtain
}

export async function showCurtain(curtain:Shape) {
    return curtain;
}


// https://miro.com/app/board/uXjVN6tGqpU=/?moveToWidget=3458764576258626775&cot=14

export async function hideCurtain(curtain:Shape) {
    curtain.style["color"] = '#ffffff00';
    curtain.style["borderOpacity"] = 0.0;
    curtain.style["fillOpacity"] = 0.0;

    await curtain.sync()
}

