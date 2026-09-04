// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IComputedAttributeMetadataObject, idRef } from "@gooddata/sdk-model";

import { type IAttributeFilterHandlerStoreContext } from "../store/types.js";

import { loadAttributeByDisplayForm } from "./loadAttributeByDisplayForm.js";

describe("loadAttributeByDisplayForm", () => {
    const computedAttributeRef = idRef("rep_performance", "computedAttribute");

    const computedAttribute = {
        type: "computedAttribute",
        ref: computedAttributeRef,
        id: "rep_performance",
        uri: "rep_performance",
        title: "Rep performance",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        expression: "SELECT 1",
        displayForms: [
            {
                type: "displayForm",
                ref: computedAttributeRef,
                attribute: computedAttributeRef,
                id: "rep_performance",
                uri: "rep_performance",
                title: "Rep performance",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                isDefault: true,
                isPrimary: true,
            },
        ],
    } as unknown as IComputedAttributeMetadataObject;

    function createContext() {
        const getComputedAttribute = vi.fn().mockResolvedValue(computedAttribute);
        const getAttributeByDisplayForm = vi.fn().mockResolvedValue({
            type: "attribute",
            ref: idRef("region", "attribute"),
            displayForms: [],
        });

        const context = {
            workspace: "ws",
            backend: {
                workspace: () => ({
                    attributes: () => ({ getAttributeByDisplayForm }),
                    computedAttributes: () => ({ getComputedAttribute }),
                }),
            },
        } as unknown as IAttributeFilterHandlerStoreContext;

        return { context, getComputedAttribute, getAttributeByDisplayForm };
    }

    it("should resolve a computed attribute display form through the computed attribute service", async () => {
        const { context, getComputedAttribute, getAttributeByDisplayForm } = createContext();

        const result = await loadAttributeByDisplayForm(context, computedAttributeRef);

        expect(getComputedAttribute).toHaveBeenCalledWith(computedAttributeRef);
        expect(getAttributeByDisplayForm).not.toHaveBeenCalled();
        // the handler works with the attribute-like surface, so the discriminator is adapted...
        expect(result.type).toEqual("attribute");
        // ...while the ref keeps telling the truth, and the fabricated display form survives intact
        expect(result.ref).toEqual(computedAttributeRef);
        expect(result.displayForms).toEqual(computedAttribute.displayForms);
    });

    it("should resolve a plain label through the attributes service", async () => {
        const { context, getComputedAttribute, getAttributeByDisplayForm } = createContext();
        const labelRef = idRef("region.name", "displayForm");

        await loadAttributeByDisplayForm(context, labelRef);

        expect(getAttributeByDisplayForm).toHaveBeenCalledWith(labelRef);
        expect(getComputedAttribute).not.toHaveBeenCalled();
    });

    it("should resolve an untyped identifier ref through the attributes service", async () => {
        const { context, getComputedAttribute, getAttributeByDisplayForm } = createContext();
        const untypedRef = idRef("region.name");

        await loadAttributeByDisplayForm(context, untypedRef);

        expect(getAttributeByDisplayForm).toHaveBeenCalledWith(untypedRef);
        expect(getComputedAttribute).not.toHaveBeenCalled();
    });
});
