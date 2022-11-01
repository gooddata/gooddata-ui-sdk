// (C) 2020-2022 GoodData Corporation
import { defaultDateFormatter } from "../defaultDateFormatter";

describe("createDefaultDateFormatter localization", () => {
    const DATE = new Date(2020, 10, 15);

    it("should support different locales", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "es-ES");
        expect(actual).toBe("nov");
    });

    it("should use provided format pattern", () => {
        const actual = defaultDateFormatter(DATE, "GDC.time.month_in_year", "en-US", "LLLLLL");
        expect(actual).toBe("November");
    });

    it("should fallback to 'en-US' when invalid locale is provided and not respect the formatting pattern", () => {
        const actual = defaultDateFormatter(
            DATE,
            "GDC.time.month_in_year",
            "surely this is not a locale" as any,
            "LLLLLL",
        );
        expect(actual).toBe("Nov");
    });

    it("should throw when invalid granularity is provided and no pattern is present", () => {
        expect(() => defaultDateFormatter(DATE, "surely this is not a granularity" as any)).toThrow();
    });

    it("should throw when invalid pattern is provided", () => {
        expect(() =>
            defaultDateFormatter(
                DATE,
                "GDC.time.date",
                "en-US",
                "surely this is not a valid formatting pattern",
            ),
        ).toThrow();
    });

    it("should use default locale and pattern", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.month_in_year");
        expect(formatter).toBe("Nov");
    });

    it("should use default format pattern for given locale", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.quarter_in_year", "fr-FR");
        expect(formatter).toBe("4ème trim.");
    });

    it("should use provided format pattern for given locale", () => {
        const formatter = defaultDateFormatter(DATE, "GDC.time.quarter_in_year", "fr-FR", "'T'Q y");
        expect(formatter).toBe("T4 2020");
    });
});
