// (C) 2007-2019 GoodData Corporation
export const unless = (predicate: () => boolean, body: () => any) => {
    if (!predicate()) {
        body();
    }
};
