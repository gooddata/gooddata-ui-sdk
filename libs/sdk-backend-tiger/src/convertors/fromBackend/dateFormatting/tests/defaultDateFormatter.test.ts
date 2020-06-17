// (C) 2020 GoodData Corporation
import { createDefaultDateFormatter } from "../defaultDateFormatter";

describe("createDefaultDateFormatter localization", () => {
    it("should support different locales", () => {
        const formatter = createDefaultDateFormatter("es-ES");
        const actual = formatter(new Date(2020, 10, 15), "GDC.time.month_in_year");
        expect(actual).toBe("nov");
    });

    it("should throw on invalid locale", () => {
        expect(() => createDefaultDateFormatter("surely this is not a locale" as any)).toThrow();
    });
});
