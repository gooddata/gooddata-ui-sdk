// (C) 2021 GoodData Corporation
import { WritableDraft } from "immer/dist/types/types-external";
import { RelativeIndex } from "../../types/layoutTypes";
import { Draft } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

export function addArrayElements<T>(arr: WritableDraft<T[]>, index: RelativeIndex, items: Draft<T[]>) {
    if (index === 0) {
        arr.unshift(...items);
    } else if (index < 0) {
        arr.push(...items);
    } else {
        arr.splice(index, 0, ...items);
    }
}

export function removeArrayElement<T>(arr: WritableDraft<T[]>, index: RelativeIndex): Draft<T> | undefined {
    if (index === 0) {
        return arr.shift();
    } else if (index < 0) {
        return arr.pop();
    } else {
        const element = arr.splice(index, 1);

        return element[0];
    }
}

export function moveArrayElement<T>(arr: WritableDraft<T[]>, fromIndex: number, toIndex: RelativeIndex) {
    const element = removeArrayElement(arr, fromIndex);

    // if this happens then there is error in the validation (or no validation) before the call
    invariant(element);

    addArrayElements(arr, toIndex, [element]);
}
