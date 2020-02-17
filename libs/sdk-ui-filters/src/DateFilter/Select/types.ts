// (C) 2007-2019 GoodData Corporation

export type SelectItemTypes = "option" | "heading" | "error" | "separator";

export interface ISelectItemOption<V> {
    type: "option";
    value: V;
    label: string;
}

export interface ISelectItemHeading {
    type: "heading";
    label: string;
}

export interface ISelectItemError {
    type: "error";
    label: string;
}

export interface ISelectItemSeparator {
    type: "separator";
}

export type ISelectItem<V> =
    | ISelectItemOption<V>
    | ISelectItemHeading
    | ISelectItemError
    | ISelectItemSeparator;
