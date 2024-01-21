// import * as React from 'react';

import {Frame, Rect, Shape} from "@mirohq/websdk-types";

// todo    function to be run for each region -> if region has to be hidden based on viewport

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

export async function checkIfRegionShouldBeHidden(region:Shape | Frame,viewPort:Rect) {
    return region.width * region.height * 10 > viewPort.height* viewPort.width;
}

export async function createRegion(frame:Frame) {

    // fontsize should be relative to region size
    const fontsize = Math.min(frame.height, frame.width) / 6.9;

    const region = await miro.board.createShape({
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

    await region.sync()

    const storage= miro.board.storage.collection('storage');

    let regions= await storage.get('regions')

    if (!regions) {
        regions = []
    }
    regions = regions as Array<string>
    regions.push({'id': region.id, 'frameId': frame.id})
    console.log('new regions', regions)
    await storage.set('regions', regions);

    await region.setMetadata('region', 'true');


    await frame.add(region);
    frame.title = "";
    await frame.sync();

    return region;
}

export async function showRegion(region:Shape) {
    let parentFrame:Frame;
    if (region.parentId != null) {
        parentFrame = await miro.board.getById(region.parentId) as Frame
    } else {
        console.error("Attempted to read parent frame id, but region had no parent frame.")
        return
        // throw new Error("Attempted to read parent frame id, but region had no parent frame.");
    }

    region.width = parentFrame.width;
    region.height = parentFrame.height;
    //region.x = parentFrame.x;
    //region.y = parentFrame.y;

    const elementCountIndex = region.content.search(/[₀-₉]/);
    region.content = (((elementCountIndex >= 0) ? ('<b>' + region.content.substring(0, elementCountIndex-4) + '</b><br>') : '<b>' + region.content.substring(0, region.content.length-4) + '</b><br>'))
        + replaceDigitsWithSubscripts((parentFrame.childrenIds.length - 1).toString());

    //await region.bringToFront()
    await region.sync();
    await fadeToOpaque(region);
}

export async function hideRegion(region:Shape) {
    await fadeToClear(region)
    region.style["borderOpacity"] = 0;
    region.style["color"] = '#ffffff';
    region.width = 8;
    region.height = 8;

    let parentFrame:Frame;
    if (region.parentId != null) {
        parentFrame = await miro.board.getById(region.parentId) as Frame
    } else {
        console.error("Attempted to read parent frame id, but region had no parent frame.")
        return
        // throw new Error("Attempted to read parent frame id, but region had no parent frame.");
    }

    //region.x = parentFrame.x+1;
    //region.y = parentFrame.y+1;

    //await region.sendToBack()
    await region.sync();
}

async function fadeToOpaque(region:Shape){

    for (let i = 1; i <= 10; i++){
        region.style["fillOpacity"] =(i/10.0);
        await region.sync();
        //setTimeout(10)

    };
}


async function fadeToClear(region:Shape){


    for (let i = 0; i < 10; i++){
        region.style["fillOpacity"] =(1-i/10.0);
        await region.sync()
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
