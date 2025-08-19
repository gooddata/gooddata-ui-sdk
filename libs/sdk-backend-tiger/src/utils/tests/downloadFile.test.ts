// (C) 2025 GoodData Corporation

import { describe, expect, it } from "vitest";
import { parseNameFromContentDisposition } from "../downloadFile.js";

describe("content disposition parsing", () => {
    it("with name %", () => {
        const result = parseNameFromContentDisposition({
            headers: {
                "content-disposition":
                    "attachment; filename=\"=?UTF-8?Q?Column_PP_no_filter_%%%.pdf?=\"; filename*=UTF-8''Column%20PP%20no%20filter%20%25%25%25.pdf",
            },
        });
        expect(result).toBe("Column PP no filter %%%.pdf");
    });

    it("special characters", () => {
        const result = parseNameFromContentDisposition({
            headers: {
                "content-disposition": 'attachment; filename="=?UTF-8?Q?%E2%82%AC%20rates.pdf?="',
            },
        });
        expect(result).toBe("€ rates.pdf");
    });

    it("with ' used as filename", () => {
        const result = parseNameFromContentDisposition({
            headers: {
                "content-disposition": 'attachment; filename="=?UTF-8?Q?Apostrophe_\'_breaks_things.xlsx?="',
            },
        });
        expect(result).toBe("Apostrophe ' breaks things.xlsx");
    });

    it("with spaces", () => {
        const result = parseNameFromContentDisposition({
            headers: {
                "content-disposition": 'attachment; filename="=?UTF-8?Q?With spaces.pdf?="',
            },
        });
        expect(result).toBe("With spaces.pdf");
    });
});
