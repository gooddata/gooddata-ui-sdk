// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { requestPages } from "../interface.js";

describe("requestPages", () => {
    it("creates correct request window for 1 page", () => {
        expect(requestPages([0, 0], [100, 1000], 1)).toMatchSnapshot();
    });

    it("creates request windows for 3 pages", () => {
        expect(requestPages([0, 0], [100, 1000], 3)).toMatchSnapshot();
    });
});
