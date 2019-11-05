// (C) 2019 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

export const emptyListItem = { empty: true };
export type EmptyListItem = typeof emptyListItem;

export function mergeElementQueryResults(
    currentElements: IElementQueryResult,
    newElements: IElementQueryResult,
): IElementQueryResult {
    const mergedElements = currentElements ? [...currentElements.elements] : [];
    const currentLength = mergedElements.length;

    // make sure the array has sufficient length for new elements
    // in case they are added "beyond" the current last item
    // otherwise splice would overwrite wrong indices
    const newLength = Math.max(currentLength, newElements.offset + newElements.elements.length);
    if (newLength > mergedElements.length) {
        mergedElements.length = newLength;
    }

    // fill the hole we might have created with dummy objects
    // because the underlying list throws on undefined members
    const holeLength = newElements.offset - currentLength;
    if (holeLength > 0) {
        mergedElements.splice(currentLength, holeLength, ...new Array(holeLength).fill({ ...emptyListItem }));
    }

    // insert the newly loaded items at their corresponding places
    mergedElements.splice(newElements.offset, newElements.elements.length, ...newElements.elements);

    return {
        ...currentElements,
        ...newElements,
        elements: mergedElements,
    };
}
