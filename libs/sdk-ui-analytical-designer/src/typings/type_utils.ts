// (C) 2007-2026 GoodData Corporation

export type PartialRecursive<O> = {
    [K in keyof O]?: PartialRecursive<O[K]>;
};
