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
        /*
         * do NOT rewrite this to splice or concat!
         * for large arrays this will cause a stack size limit breach
         *
         * Illustration:
         * Say we have an attribute with 250 000 elements. We have the range (0;500) loaded and then we request
         * the range (240 000; 240 500). This means we need to fill a hole 239 500 items big.
         * If we do that like
         *
         * mergedItems.splice(currentLength, holeLength, ...new Array(holeLength).fill({ ...emptyListItem }));
         *
         * then since that gets translated roughly to
         *
         * mergedItems.splice.apply(mergedItems, currentLength, holeLength, new Array(holeLength).fill({ ...emptyListItem }));
         *
         * it effectively calls the splice function with 239 503 arguments. Each argument has to be placed on
         * the stack as it is a part of the call frame and even though these are pointers, the sheer number of them
         * is more than enough to hit the stack size limit.
         *
         * Fun fact: Chrome and Safari report this as
         * > RangeError: Maximum call stack size exceeded
         * which is technically true, but not as helpful as Firefox's
         * > RangeError: too many arguments provided for a function call
         *
         * So instead, we "fill the hole" one element at the time which does not put any unreasonable pressure on the stack
         * and should be comparable performance-wise.
         */
        for (let i = currentLength; i < currentLength + holeLength; i++) {
            mergedItems[i] = { ...emptyListItem };
        }
    }

    // insert the newly loaded items at their corresponding places
    mergedItems.splice(newElements.offset, newElements.items.length, ...newElements.items);

    return {
        ...currentElements,
        ...newElements,
        items: mergedItems,
    };
}
