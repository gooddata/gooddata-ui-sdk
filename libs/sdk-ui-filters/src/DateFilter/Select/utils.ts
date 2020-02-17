// (C) 2019 GoodData Corporation
import { ISelectItem, ISelectItemOption } from "./types";

export const itemToString = <V>(item: ISelectItem<V>): string => {
    if (item && item.type === "option" && item.label) {
        return item.label;
    }
    return "";
};

export const getSelectableItems = <V>(selectItems: Array<ISelectItem<V>>): Array<ISelectItemOption<V>> =>
    selectItems.filter((item): item is ISelectItemOption<V> => item.type === "option");
