// (C) 2019-2020 GoodData Corporation
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IElementQueryResultWithEmptyItems, emptyListItem } from "./types";

export function mergeElementQueryResults(
    currentElements: IElementQueryResultWithEmptyItems,
    newElements: IElementsQueryResult,
): IElementQueryResultWithEmptyItems {
    const mergedItems = currentElements ? [...currentElements.items] : [];
    const currentLength = mergedItems.length;

    // make sure the array has sufficient length for new elements
    // in case they are added "beyond" the current last item
    // otherwise splice would overwrite wrong indices
    const newLength = Math.max(currentLength, newElements.offset + newElements.items.length);
    if (newLength > mergedItems.length) {
        mergedItems.length = newLength;
    }

    // fill the hole we might have created with dummy objects
    // because the underlying list throws on undefined members
    const holeLength = newElements.offset - currentLength;
    if (holeLength > 0) {
        mergedItems.splice(currentLength, holeLength, ...new Array(holeLength).fill({ ...emptyListItem }));
    }

    // insert the newly loaded items at their corresponding places
    mergedItems.splice(newElements.offset, newElements.items.length, ...newElements.items);

    return {
        ...currentElements,
        ...newElements,
        items: mergedItems,
    };
}
