// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type StoreContext } from "../../types.js";
import { addContextReference } from "../addContextReference.js";
import { type IGenAIContextObject } from "../collectContextReferences.js";

describe("addContextReference", () => {
    const dashboardRef = idRef("dash1");
    const ambientContext: StoreContext = {
        ambient: {
            view: {
                dashboard: {
                    ref: dashboardRef,
                    title: "Dashboard 1",
                    widgets: [],
                    filters: [],
                },
            },
        },
        ambientMode: "suppressed",
    };

    it("should return same context if reference is undefined", () => {
        const result = addContextReference(ambientContext, undefined);
        expect(result).toBe(ambientContext);
    });

    it("should return same context if reference.where is not view.dashboard", () => {
        const reference: IGenAIContextObject = {
            id: "other",
            ref: idRef("other"),
            title: "Other",
            type: "insight" as any,
            where: "other" as any,
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toBe(ambientContext);
    });

    it("should set ambientMode to enabled if reference matches ambient dashboard ref", () => {
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toEqual({
            ...ambientContext,
            ambientMode: "enabled",
        });
    });

    it("should return same context if reference does not match ambient dashboard ref", () => {
        const reference: IGenAIContextObject = {
            id: "dash2",
            ref: idRef("dash2"),
            title: "Dashboard 2",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(ambientContext, reference);
        expect(result).toBe(ambientContext);
    });

    it("should return same context if ambient is missing", () => {
        const context: StoreContext = { ambientMode: "suppressed" };
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(context, reference);
        expect(result).toBe(context);
    });

    it("should return same context if ambient.view.dashboard is missing", () => {
        const context: StoreContext = {
            ambient: {
                view: {},
            },
            ambientMode: "suppressed",
        };
        const reference: IGenAIContextObject = {
            id: "dash1",
            ref: dashboardRef,
            title: "Dashboard 1",
            type: "dashboard",
            where: "view.dashboard",
            nesting: 0,
        };
        const result = addContextReference(context, reference);
        expect(result).toBe(context);
    });
});
