// (C) 2020-2023 GoodData Corporation

import { convertState } from "../state.js";
import { describe, expect, it } from "vitest";

describe("state convert", () => {
    it("BOOLEAN to true", () => {
        expect(convertState("BOOLEAN", [true, false], true)).toEqual(true);
        expect(convertState("BOOLEAN", [true, false], "ENABLED")).toEqual(true);
        expect(convertState("BOOLEAN", [true, false], "enabled")).toEqual(true);
        expect(convertState("BOOLEAN", [true, false], "EnABlED")).toEqual(true);
        expect(convertState("BOOLEAN", [true, false], "TRUE")).toEqual(true);
        expect(convertState("BOOLEAN", [true, false], "true")).toEqual(true);
    });

    it("BOOLEAN to false", () => {
        expect(convertState("BOOLEAN", [true, false], false)).toEqual(false);
        expect(convertState("BOOLEAN", [true, false], "DISABLED")).toEqual(false);
        expect(convertState("BOOLEAN", [true, false], "disabled")).toEqual(false);
        expect(convertState("BOOLEAN", [true, false], "DiSaBLeD")).toEqual(false);
        expect(convertState("BOOLEAN", [true, false], "FALSE")).toEqual(false);
        expect(convertState("BOOLEAN", [true, false], "false")).toEqual(false);
    });

    it("BOOLEAN to undefined", () => {
        expect(convertState("BOOLEAN", [true, false], "dfdfdf")).toEqual(undefined);
        expect(convertState("BOOLEAN", [true, false], "")).toEqual(undefined);
        expect(convertState("BOOLEAN", [true, false], "0")).toEqual(undefined);
    });

    it("BOOLEAN to true only", () => {
        expect(convertState("BOOLEAN", [true], "ENABLED")).toEqual(true);
        expect(convertState("BOOLEAN", [true], "TRUE")).toEqual(true);
        expect(convertState("BOOLEAN", [true], true)).toEqual(true);
        expect(convertState("BOOLEAN", [true], "DISABLED")).toEqual(undefined);
        expect(convertState("BOOLEAN", [true], false)).toEqual(undefined);
        expect(convertState("BOOLEAN", [true], "")).toEqual(undefined);
        expect(convertState("BOOLEAN", [true], "0")).toEqual(undefined);
    });

    it("STRING as valid option", () => {
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], "DISABLED")).toEqual(
            "Disabled",
        );
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], "behaveasa")).toEqual(
            "BehaveAsA",
        );
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], "BehaveAsA")).toEqual(
            "BehaveAsA",
        );
    });

    it("STRING as invalid option", () => {
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], false)).toEqual(undefined);
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], "test")).toEqual(undefined);
        expect(convertState("STRING", ["Disabled", "BehaveAsA", "BehaveAsB"], "enabled")).toEqual(undefined);
    });
});
