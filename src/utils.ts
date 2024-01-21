import {Item} from "@mirohq/websdk-types";

type PositionedItem = {
    x: number,
    y: number,
} & Item;

export const getGlobalCoordinates = async (item: PositionedItem): Promise<{x:number, y:number}> => {
    var x = item.x;
    var y = item.y;

    if (item.parentId) {
        let parent = await miro.board.getById(item.parentId);
        if (parent && "x" in parent) {
            let offset = await getGlobalCoordinates(parent);
            x += offset.x - parent.width!/2;
            y += offset.y - parent.height!/2;
        }
    }
    return {x, y};
};