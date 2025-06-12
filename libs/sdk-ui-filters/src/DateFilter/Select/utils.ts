// (C) 2019-2022 GoodData Corporation
import { ISelectItem, ISelectItemOption } from "./types.js";

export const itemToString = <V>(item: ISelectItem<V>): string => {
    if (item?.type === "option" && item.label) {
        return item.label;
    }
    return "";
};

export const getSelectableItems = <V>(selectItems: Array<ISelectItem<V>>): Array<ISelectItemOption<V>> =>
    selectItems.filter((item): item is ISelectItemOption<V> => item.type === "option");
