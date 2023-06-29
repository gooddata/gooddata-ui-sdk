// (C) 2019-2022 GoodData Corporation
import path from "path";
import { replaceInFiles } from "../replaceInFiles.js";
import { it, describe, expect, vi } from "vitest";

describe("replaceInFiles", () => {
    it("should replace values according to the spec", async () => {
        const readFileMock = async () => "foo bar baz buz";
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

        await replaceInFiles(".", spec, readFileMock as any, writeFileMock);

        expect(writeFileMock).toHaveBeenLastCalledWith(
            path.join(".", "directory", "b.js"),
            "foo replaced baz buf",
            { encoding: "utf8", flag: "w" },
        );
    });
});
