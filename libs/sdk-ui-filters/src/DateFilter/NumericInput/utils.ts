// (C) 2007-2020 GoodData Corporation
export const unless = (predicate: () => boolean, body: () => any): void => {
    if (!predicate()) {
        body();
    }
};
