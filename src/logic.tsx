// import * as React from 'react';

import {Board, BoardViewport, Frame, Miro, Rect, Shape} from "@mirohq/websdk-types";

export async function addSticky() {
    const stickyNote = await miro.board.createStickyNote({
        content: 'Hello, World!',
        width: 1000
    });

    await miro.board.viewport.zoomTo(stickyNote);
}

// todo    function to be run for each curtain -> if curtain has to be hidden based on viewport

export function isShapeInsideViewport(shape: Shape | Frame, viewport: Rect): boolean {
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

export async function checkIfCurtainShouldBeHidden(curtain:Shape | Frame,viewPort:Rect) {
    return curtain.width * curtain.height * 10 > viewPort.height* viewPort.width;
}

export async function createCurtain(frame:Frame) {

    // fontsize should be relative to curtain size
    const fontsize = Math.min(frame.height, frame.width) / 5.0;

    const curtain = await miro.board.createShape({
        content: '<p>' + frame.title + '</p>',
        shape: 'rectangle',
        style: {
            color: '#ffffff', // Default text color: '#1a1a1a' (black)
            fillColor: '#2f00ff', // Default shape fill color: transparent (no fill)
            fontFamily: 'arial', // Default font type for the text
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

    curtain.content = curtain.content + '(' + frame.childrenIds.length + ' elements)'
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

    return await frame.add(curtain);
}

export async function showCurtain(curtain:Shape) {
    curtain.style["fillOpacity"] = 1.0;
    curtain.style["color"] = '#ffffff';

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

    const bracketIndex = curtain.content.indexOf('(');
    curtain.content = ((bracketIndex !== -1) ? curtain.content.substring(0, bracketIndex) : curtain.content)
        + '(' + parentFrame.childrenIds.length + ' elements)';

    await curtain.sync();
}

export async function hideCurtain(curtain:Shape) {
    curtain.style["fillOpacity"] = 0;
    curtain.style["fillOpacity"] = 0;//getOpaqueness(viewPort,curtain);
    curtain.style["borderOpacity"] = 0;
    curtain.style["color"] = '#ff000000';
    curtain.width = 100;
    curtain.height = 100;

    await curtain.sync();
}