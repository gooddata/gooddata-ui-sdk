// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type DashboardAttributeFilterItem, type ObjRef, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../../types/commonTypes.js";

import { canFilterBeAdded } from "./uniqueFiltersValidation.js";

function attributeFilterItem(displayForm: ObjRef): DashboardAttributeFilterItem {
    return {
        attributeFilter: {
            displayForm,
            attributeElements: { uris: [] },
            negativeSelection: true,
            localIdentifier: "f1",
        },
    };
}

function contextMock(
    getAttributeDisplayForm: ReturnType<typeof vi.fn>,
    getAttributeDisplayForms: ReturnType<typeof vi.fn>,
): DashboardContext {
    return {
        workspace: "ws",
        backend: {
            workspace: () => ({
                attributes: () => ({
                    getAttributeDisplayForm,
                    getAttributeDisplayForms,
                }),
            }),
        } as unknown as IAnalyticalBackend,
    } as DashboardContext;
}

describe("canFilterBeAdded", () => {
    it("resolves a computed attribute without asking the labels service", async () => {
        const getAttributeDisplayForm = vi.fn();
        const getAttributeDisplayForms = vi.fn(() =>
            Promise.resolve([{ attribute: idRef("account", "attribute") }]),
        );

        const result = await canFilterBeAdded(
            contextMock(getAttributeDisplayForm, getAttributeDisplayForms),
            idRef("ca_1", "computedAttribute"),
            [attributeFilterItem(idRef("account.name", "displayForm"))],
        );

        expect(result).toBe(true);
        // the labels service must never see the computed attribute ref - it would 404 on it
        expect(getAttributeDisplayForm).not.toHaveBeenCalled();
        expect(getAttributeDisplayForms).toHaveBeenCalledWith([idRef("account.name", "displayForm")]);
    });

    it("keeps computed attribute filters out of the labels batch and detects the duplicate", async () => {
        const getAttributeDisplayForm = vi.fn();
        const getAttributeDisplayForms = vi.fn();

        const result = await canFilterBeAdded(
            contextMock(getAttributeDisplayForm, getAttributeDisplayForms),
            idRef("ca_1", "computedAttribute"),
            [attributeFilterItem(idRef("ca_1", "computedAttribute"))],
        );

        expect(result).toBe(false);
        expect(getAttributeDisplayForm).not.toHaveBeenCalled();
        expect(getAttributeDisplayForms).not.toHaveBeenCalled();
    });

    it("still validates plain attributes through the labels service", async () => {
        const getAttributeDisplayForm = vi.fn(() =>
            Promise.resolve({ attribute: idRef("account", "attribute") }),
        );
        const getAttributeDisplayForms = vi.fn(() =>
            Promise.resolve([{ attribute: idRef("account", "attribute") }]),
        );

        const result = await canFilterBeAdded(
            contextMock(getAttributeDisplayForm, getAttributeDisplayForms),
            idRef("account.name", "displayForm"),
            [attributeFilterItem(idRef("account.id", "displayForm"))],
        );

        expect(result).toBe(false);
    });
});
