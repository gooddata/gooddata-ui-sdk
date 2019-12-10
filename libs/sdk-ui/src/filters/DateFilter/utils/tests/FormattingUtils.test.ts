// (C) 2019 GoodData Corporation
import { sanitizeLocaleForMoment } from "../FormattingUtils";

describe("sanitizeLocaleForMoment", () => {
    it("should sanitize the zh-Hans locale", () => {
        const expected = "zh-CN";
        const actual = sanitizeLocaleForMoment("zh-Hans");
        expect(actual).toEqual(expected);
    });

    it.each(["de-DE", "en-US", "es-ES", "fr-FR", "ja-JP", "nl-NL", "pt-BR", "pt-PT"])(
        "should not touch %s locale",
        (value: string) => {
            const expected = value;
            const actual = sanitizeLocaleForMoment(value);
            expect(actual).toEqual(expected);
        },
    );

    it("should not fail with falsy value", () => {
        const actual = sanitizeLocaleForMoment(undefined);
        expect(actual).toBeUndefined();
    });
});
