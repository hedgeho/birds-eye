// import * as React from 'react';

import {Frame, Shape} from "@mirohq/websdk-types";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

// todo    function to be run for each curtain -> if curtain has to be hidden based on viewport

export async function checkIfCurtainShouldBeHidden(curtain:Shape,viewPortHeight:number,viewPortWidth:number)
{
    return curtain.width * curtain.height *10 > viewPortWidth * viewPortHeight ;
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
        width: frame.width,
        height: frame.height
    });

    await frame.add(curtain)
    // await hideCurtain(curtain)
    return curtain
}

export async function showCurtain(curtain:Shape) {
    curtain.style["fillOpacity"] = 1.0;
    curtain.style["borderOpacity"] = 1.0;
    curtain.style["color"] = '#ffffff';

    let parentFrame:Frame;
    if (curtain.parentId != null) {
        parentFrame = await miro.board.getById(curtain.parentId) as Frame
    } else {
        throw new Error("Attempted to read parent frame id, but curtain had no parent frame.");
    }

    curtain.width = parentFrame.width;
    curtain.height = parentFrame.height;

    await curtain.sync();
}

export async function hideCurtain(curtain:Shape) {
    curtain.style["fillOpacity"] = 0;
    curtain.style["borderOpacity"] = 0;
    curtain.style["color"] = '#ff000000';
    curtain.width = 100;
    curtain.height = 100;

    await curtain.sync();
}