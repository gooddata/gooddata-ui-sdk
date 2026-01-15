// (C) 2019-2026 GoodData Corporation

import path from "path";

import { describe, expect, it, vi } from "vitest";

import { replaceInFiles } from "../replaceInFiles.js";

describe("replaceInFiles", () => {
    it("should replace values according to the spec", async () => {
        const readFileMock = vi.fn().mockResolvedValue("foo bar baz buz");
        const writeFileMock = vi.fn();

        const spec = {
            directory: {
                "b.js": [
                    { regex: /bar/g, value: "replaced", apply: true },
                    { regex: /baz/g, value: "not replaced", apply: false },
                    { regex: /buz/g, value: "buf" },
                ],
            },
        };

        await replaceInFiles(".", spec, readFileMock, writeFileMock);

        expect(writeFileMock).toHaveBeenLastCalledWith(
            path.join(".", "directory", "b.js"),
            "foo replaced baz buf",
            { encoding: "utf8", flag: "w" },
        );
    });
});
