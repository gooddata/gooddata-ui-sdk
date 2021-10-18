// (C) 2021 GoodData Corporation
import { validatePluginUrlIsSane } from "../pluginUrlValidation";

describe("plugin url validation", () => {
    const InvalidUrlScenarios: Array<[string, string]> = [
        ["URL with .", "https://example.com/abc/./test"],
        ["URL with ..", "https://example.com/abc/../test"],
        ["URL with javascript schema", "javascript:alert(document.domain)"],
        ["URL with vbscript schema", "vbscript:evil"],
        ["URL with data schema", "data:evil"],
        ["URL without schema", "example.com/abc"],
        ["URL with http schema", "http://example.com/abc"],
        ["URL with percent encoded evil", "https://example.com%2Fabc%2F..%2Ftest"],
    ];

    it.each(InvalidUrlScenarios)("should %s", (_desc, url) => {
        const reason = validatePluginUrlIsSane(url);

        expect(reason).toBeDefined();
        expect(reason).toMatchSnapshot();
    });

    it("should validate correct URL", () => {
        expect(validatePluginUrlIsSane("https://example.com/myPluginHost")).toBeUndefined();
    });
});
