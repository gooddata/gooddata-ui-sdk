// (C) 2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import * as raf from "raf";

raf.polyfill();

// this is required due to: https://github.com/jsdom/jsdom/issues/3002
// the following snippet is documented as a workaround in that issue:
document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = jest.fn();

    range.getClientRects = () => {
        return {
            item: () => null,
            length: 0,
            [Symbol.iterator]: jest.fn(),
        };
    };

    return range;
};
