// (C) 2007-2025 GoodData Corporation
import { beforeEach, describe, expect, it } from "vitest";

import { guidFor } from "../guid.js";

describe("ReactGuid", () => {
    let guidValue: number = window._gd_uuid; // eslint-disable-line no-underscore-dangle

    const getGuid = (guid: number) => {
        return `gd-guid-${guid}`;
    };

    beforeEach(() => {
        guidValue = window._gd_uuid; // eslint-disable-line no-underscore-dangle
    });

    it("should set guid property", () => {
        const obj: any = {};
        guidFor(obj);

        expect(obj.__infID).toMatch(/[a-zA-Z]+/); // eslint-disable-line no-underscore-dangle
    });

    it("should get new guid for new object", () => {
        expect(guidFor({})).toEqual(getGuid(guidValue + 1));
    });

    it("should get old guid for existing object", () => {
        const bodyGuid = getGuid(guidValue + 1);
        const obj = {};

        expect(guidFor(obj)).toEqual(bodyGuid);
        expect(guidFor(obj)).toEqual(bodyGuid);
    });

    it("should return identifier for object", () => {
        expect(guidFor(Object)).toEqual("(Object)");
    });

    it("should return identifier for array", () => {
        expect(guidFor(Array)).toEqual("(Array)");
    });
});
