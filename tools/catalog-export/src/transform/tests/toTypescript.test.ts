// (C) 2007-2023 GoodData Corporation
import { describe, it, expect } from "vitest";
import { bearLoad } from "../../loaders/bear/bearLoad.js";
import { transformToTypescript } from "../toTypescript.js";

describe("transformToTypescript", () => {
    const projectMeta = bearLoad("test");

    it("creates new catalog", async () => {
        const transformResult = transformToTypescript(await projectMeta, "testOutput.ts", false);

        /*
         * NOTE: source.getFullText() should not be used here as it includes the leading comments that
         * contains timestamp describing when was the file generated.
         */
        expect(transformResult.sourceFile.getText()).toMatchSnapshot();
    });
});
