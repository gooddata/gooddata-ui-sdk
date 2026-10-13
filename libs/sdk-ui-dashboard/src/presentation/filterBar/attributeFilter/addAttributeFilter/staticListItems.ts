// (C) 2026 GoodData Corporation

export type IHeaderListItem = {
    type: "header";
    title: string;
};

export type ISeparatorListItem = {
    type: "separator";
};

export type IStaticListItem = IHeaderListItem | ISeparatorListItem;

export const isHeaderListItem = (item: unknown): item is IHeaderListItem => {
    return typeof item === "object" && item !== null && "type" in item && item.type === "header";
};

export const isSeparatorListItem = (item: unknown): item is ISeparatorListItem => {
    return typeof item === "object" && item !== null && "type" in item && item.type === "separator";
};
