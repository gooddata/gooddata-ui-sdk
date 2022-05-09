// (C) 2019-2022 GoodData Corporation
// import moment from "moment";
import { convertDateToPlatformDateString, convertPlatformDateStringToDate } from "../DateConversions";

describe("convertDateToPlatformDate", () => {
    it("should convert Date object to string in platform date", () => {
        const date = convertDateToPlatformDateString(new Date(2019, 11, 1));
        expect(date).toBe("2019-12-01");
    });

    it("should return undefined to undefined Date object", () => {
        const date = convertDateToPlatformDateString(undefined);
        expect(date).toBe(undefined);
    });

    it("should return null to null Date object", () => {
        const date = convertDateToPlatformDateString(null);
        expect(date).toBe(null);
    });
});

describe("convertPlatformDateStringToDate", () => {
    it("should return undefined to undefined input value", () => {
        const date = convertPlatformDateStringToDate(undefined);
        expect(date).toBe(undefined);
    });

    it('should return null to null input value"', () => {
        const date = convertPlatformDateStringToDate(null);
        expect(date).toBe(null);
    });

    it("should convert platform date string to Date object", () => {
        const dateNow = jest.spyOn(Date, "now").mockReturnValue(1575158400000);
        const getTimezoneOffset = jest.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(270);
        const date = convertPlatformDateStringToDate("2019-12-01");
        expect(date.toISOString()).toBe(new Date(1575174600000).toISOString());

        getTimezoneOffset.mockRestore();
        dateNow.mockRestore();
    });
});
