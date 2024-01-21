// import * as React from 'react';

import {Frame, Rect, Shape} from "@mirohq/websdk-types";

// todo    function to be run for each curtain -> if curtain has to be hidden based on viewport

export function isShapeInsideViewport(shape: Shape | Frame, viewport: Rect): boolean {
    const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = shape;
    // console.log(shapeX, shapeY, viewport)
    const { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight } = viewport;

    const intersectionRight = Math.min(shapeX + shapeWidth / 2, viewportX + viewportWidth)
    const intersectionLeft = Math.max(shapeX - shapeWidth / 2, viewportX)
    const intersectionBottom = Math.min(shapeY + shapeHeight / 2, viewportY + viewportHeight);
    const intersectionTop = Math.min(shapeY - shapeHeight / 2, viewportY);

    if (intersectionTop > intersectionBottom || intersectionRight < intersectionLeft) {
        return false;
    }

    const screenArea = viewportWidth * viewportHeight;
    const intersectionArea = (intersectionRight - intersectionLeft) * (intersectionBottom - intersectionTop);
    const shapeArea = shapeWidth * shapeHeight;
    const fillRatio = intersectionArea / screenArea;
    const presenceRatio = intersectionArea / shapeArea;
    return fillRatio > 0.5 || presenceRatio > 0.5;
}

export async function checkIfCurtainShouldBeHidden(curtain:Shape | Frame,viewPort:Rect) {
    return curtain.width * curtain.height * 10 > viewPort.height* viewPort.width;
}

export async function createCurtain(frame:Frame) {

    // fontsize should be relative to curtain size
    const fontsize = Math.min(frame.height, frame.width) / 6.9;

    const curtain = await miro.board.createShape({
        content:
            ((frame.title.trim() == "")
                ? ('<b>Title here</b><br>') : ('<b>' + frame.title + '</b><br>'))
            + replaceDigitsWithSubscripts(frame.childrenIds.length.toString()),
        shape: 'round_rectangle',
        style: {
            color: '#ffffff', // Default text color: '#1a1a1a' (black)
            fillColor: pickColor(), // Default shape fill color: transparent (no fill)
            fontFamily: 'roboto_mono', // Default font type for the text
            fontSize: fontsize, // Default font size for the text, in dp
            textAlign: 'center', // Default horizontal alignment for the text
            textAlignVertical: 'middle', // Default vertical alignment for the text
            borderStyle: 'normal', // Default border line style
            borderOpacity: 0, // Default border color opacity: no opacity
            borderColor: '#2f00ff', // Default border color: '#ffffff` (white)
            borderWidth: 0, // Default border width
            fillOpacity: 1.0, // Default fill color opacity: no opacity
        },
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height
    });

    await curtain.sync()

    const storage= miro.board.storage.collection('storage');

    let curtains= await storage.get('curtains')

    if (!curtains) {
        curtains = []
    }
    curtains = curtains as Array<string>
    curtains.push({'id': curtain.id, 'frameId': frame.id})
    console.log('new curtains', curtains)
    await storage.set('curtains', curtains);

    await curtain.setMetadata('curtain', 'true');


    await frame.add(curtain);
    frame.title = "";
    await frame.sync();

    return curtain;
}

export async function showCurtain(curtain:Shape) {
    let parentFrame:Frame;
    if (curtain.parentId != null) {
        parentFrame = await miro.board.getById(curtain.parentId) as Frame
    } else {
        console.error("Attempted to read parent frame id, but curtain had no parent frame.")
        return
        // throw new Error("Attempted to read parent frame id, but curtain had no parent frame.");
    }

    curtain.width = parentFrame.width;
    curtain.height = parentFrame.height;
    //curtain.x = parentFrame.x;
    //curtain.y = parentFrame.y;

    const elementCountIndex = curtain.content.search(/[₀-₉]/);
    curtain.content = (((elementCountIndex >= 0) ? ('<b>' + curtain.content.substring(0, elementCountIndex-4) + '</b><br>') : '<b>' + curtain.content.substring(0, curtain.content.length-4) + '</b><br>'))
        + replaceDigitsWithSubscripts((parentFrame.childrenIds.length - 1).toString());

    //await curtain.bringToFront()
    await curtain.sync();
    await fadeToOpaque(curtain);
}

export async function hideCurtain(curtain:Shape) {
    await fadeToClear(curtain)
    curtain.style["borderOpacity"] = 0;
    curtain.style["color"] = '#ffffff';
    curtain.width = 8;
    curtain.height = 8;

    let parentFrame:Frame;
    if (curtain.parentId != null) {
        parentFrame = await miro.board.getById(curtain.parentId) as Frame
    } else {
        console.error("Attempted to read parent frame id, but curtain had no parent frame.")
        return
        // throw new Error("Attempted to read parent frame id, but curtain had no parent frame.");
    }

    //curtain.x = parentFrame.x+1;
    //curtain.y = parentFrame.y+1;

    //await curtain.sendToBack()
    await curtain.sync();
}

async function fadeToOpaque(curtain:Shape){

    for (let i = 1; i <= 10; i++){
        curtain.style["fillOpacity"] =(i/10.0);
        await curtain.sync();
        //setTimeout(10)

    };
}


async function fadeToClear(curtain:Shape){


    for (let i = 0; i < 10; i++){
        curtain.style["fillOpacity"] =(1-i/10.0);
        await curtain.sync()
        // await sleep(10)
    };

}

function pickColor(){
    const colours=["#264653","#2a9d8f","#e9c46a","#f4a261","#e76f51"];
    const randomIndex = Math.floor(Math.random() * colours.length);
    const randomColour = colours[randomIndex];
    return randomColour;

}

function replaceDigitsWithSubscripts(input: string): string {
    const subscriptMap: Record<string, string> = {
        '0': '₀',
        '1': '₁',
        '2': '₂',
        '3': '₃',
        '4': '₄',
        '5': '₅',
        '6': '₆',
        '7': '₇',
        '8': '₈',
        '9': '₉',
    };

    let output = '';
    for (const char of input) {
        if (char >= '0' && char <= '9') {
            output += subscriptMap[char];
        } else {
            output += char;
        }
    }

    return output;
}
