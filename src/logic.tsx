// import * as React from 'react';
//import { erf } from 'mathjs';
import {Board, BoardViewport, Frame, Miro, Rect, Shape} from "@mirohq/websdk-types";

export async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

// todo    function to be run for each curtain -> if curtain has to be hidden based on viewport

export async function checkIfCurtainShouldBeHidden(curtain:Shape,viewPort:Rect) {

    function isShapeInsideViewport(shape: Shape, viewport: Rect): boolean {
        const { x: shapeX, y: shapeY, width: shapeWidth, height: shapeHeight } = shape;
        const { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight } = viewport;
        const shapeRight = shapeX + shapeWidth;
        const shapeBottom = shapeY + shapeHeight;
        const viewportRight = viewportX + viewportWidth;
        const viewportBottom = viewportY + viewportHeight;
        const isLeftInside = shapeX >= viewportX;
        const isRightInside = shapeRight <= viewportRight;
        const isTopInside = shapeY >= viewportY;
        const isBottomInside = shapeBottom <= viewportBottom;

        // Return the logical AND of the four conditions
        return isLeftInside && isRightInside && isTopInside && isBottomInside;
    }


    if (isShapeInsideViewport(curtain,viewPort)){return curtain.width * curtain.height * 10 > viewPort.height* viewPort.width;}
    else return false
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

    await curtain.setMetadata('curtain', 'true')

    return await frame.add(curtain);
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
    curtain.style["fillOpacity"] = 0;//getOpaqueness(viewPort,curtain);
    curtain.style["borderOpacity"] = 0;
    curtain.style["color"] = '#ff000000';
    curtain.width = 100;
    curtain.height = 100;

    await curtain.sync();
}
/*
function getOpaqueness(viewport: Rect, curtain: Shape): number {
    // Destructure the rectangle object into its properties
    const {width: viewportWidth, height: viewportHeight } = viewport;
    // Destructure the shape object into its properties
    const {width: curtainWidth, height: curtainHeight } = curtain;
    // Calculate the area of the rectangle
    const viewportArea = viewportWidth * viewportHeight;
    // Calculate the area of the shape
    const curtainArea = curtainWidth * curtainHeight;
    // Calculate the ratio of the rectangle's area to the shape's area
    const ratio = viewportArea / curtainArea;

    // Use the error function to calculate the opaqueness of the shape
    // The formula is based on the image you sent
    // You can adjust the parameters as you wish
    return (erf(-ratio / (10 * Math.sqrt(2))) + 1) / 2;

}*/