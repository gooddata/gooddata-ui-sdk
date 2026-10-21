// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { withoutUndefined } from "./declarativeFields.js";

interface IOutput {
    id: string;
    description?: string | null;
}

describe("withoutUndefined", () => {
    it("drops the undefined keys and keeps the null keys", () => {
        const output: IOutput = withoutUndefined({ id: "a", description: null });

        expect(withoutUndefined<IOutput>({ id: "a", description: undefined })).toStrictEqual({ id: "a" });
        expect(output).toStrictEqual({ id: "a", description: null });
    });

    it("checks the keys against the output type", () => {
        const description = "text";
        const convert = (): IOutput =>
            // @ts-expect-error -- IOutput has no "descripton" key
            withoutUndefined({ id: "a", descripton: description });

        expect(convert()).toStrictEqual({ id: "a", descripton: "text" });
    });
});
