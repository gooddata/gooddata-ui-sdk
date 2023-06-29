// (C) 2019-2020 GoodData Corporation
import { formatTime, normalizeTime, updateTime, TIME_ANCHOR } from "../timeUtilities.js";
import { describe, it, expect } from "vitest";

describe("timeUtilities", () => {
    it("should format time", () => {
        const time = formatTime(7, 15);
        expect(time).toEqual("07:15 AM");
    });

    it("should update time", () => {
        const now = new Date();
        now.setHours(7);
        now.setMinutes(15);
        now.setSeconds(0);
        now.setMilliseconds(0);

        const time = updateTime(7, 15);
        expect(time).toEqual(now);
    });

    it("should normalize time", () => {
        const now = new Date();
        now.setHours(8);
        now.setMinutes(15);

        let time = normalizeTime(now);
        expect(time.getHours()).toEqual(8);
        expect(time.getMinutes()).toEqual(TIME_ANCHOR);

        now.setHours(8);
        now.setMinutes(TIME_ANCHOR);

        time = normalizeTime(now);
        expect(time.getHours()).toEqual(9);
        expect(time.getMinutes()).toEqual(0);

        now.setHours(8);
        now.setMinutes(35);

        time = normalizeTime(now);
        expect(time.getHours()).toEqual(9);
        expect(time.getMinutes()).toEqual(0);
    });
});
