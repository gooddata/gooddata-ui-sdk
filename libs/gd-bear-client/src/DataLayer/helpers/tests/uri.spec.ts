// (C) 2007-2018 GoodData Corporation
import { isUri } from "../uri";

describe("isUri", () => {
    it("should return true", () => {
        expect(isUri("/gdc/md/a/obj/1")).toEqual(true);
    });

    it("should return false", () => {
        expect(isUri("a")).toEqual(false);
        expect(isUri("/gdc")).toEqual(false);
        expect(isUri("/gdc/md")).toEqual(false);
        expect(isUri("/gdc/md/a")).toEqual(false);
        expect(isUri("/gdc/md/a/obj")).toEqual(false);
        expect(isUri("/gdc/md/a/obj/a")).toEqual(false);
    });
});
