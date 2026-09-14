// (C) 2026 GoodData Corporation

// @vitest-environment node

import { runSaga } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IAttributeDisplayFormMetadataObject, idRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import {
    selectAllCatalogDisplayFormsMap,
    selectCatalogDateAttributes,
} from "../../store/catalog/catalogSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import { getAttributeIdentifiersReplacements } from "./resolveDrillToCustomUrl.js";

// A computed attribute's display form is fabricated client-side; its ref carries the computed
// attribute type rather than "displayForm".
const computedAttributeDisplayForm = {
    type: "displayForm",
    id: "ca1",
    ref: idRef("ca1", "computedAttribute"),
    attribute: idRef("ca1", "computedAttribute"),
    title: "Performance band",
} as IAttributeDisplayFormMetadataObject;

function intersection(labelId: string, primaryValue: string): IDrillEventIntersectionElement[] {
    return [
        {
            header: {
                attributeHeader: {
                    identifier: labelId,
                    ref: idRef(labelId, "computedAttribute"),
                    localIdentifier: "a1",
                    uri: "",
                    name: "Performance band",
                    formOf: {
                        identifier: labelId,
                        ref: idRef(labelId, "computedAttribute"),
                        uri: "",
                        name: "Performance band",
                    },
                },
                attributeHeaderItem: { uri: primaryValue, name: primaryValue },
            },
        } as unknown as IDrillEventIntersectionElement,
    ];
}

function createContext(elementTitle: string) {
    const queryBuilder = {
        withLimit: () => queryBuilder,
        withOptions: () => queryBuilder,
        query: () => Promise.resolve({ items: [{ title: elementTitle }] }),
    };

    const getAttributeDisplayForms = vi.fn().mockResolvedValue([]);
    const getComputedAttribute = vi.fn().mockResolvedValue({
        type: "computedAttribute",
        id: "ca1",
        ref: idRef("ca1", "computedAttribute"),
        displayForms: [computedAttributeDisplayForm],
    });

    const backend = {
        capabilities: { supportsElementUris: false },
        workspace: () => ({
            attributes: () => ({
                getAttributeDisplayForms,
                elements: () => ({ forDisplayForm: () => queryBuilder }),
            }),
            computedAttributes: () => ({ getComputedAttribute }),
        }),
    };

    return {
        ctx: { workspace: "ws", backend } as unknown as DashboardContext,
        getAttributeDisplayForms,
        getComputedAttribute,
    };
}

/**
 * @param catalogHit - whether the catalog carries the computed attribute's display form
 */
function run(saga: any, catalogHit: boolean, ...args: any[]) {
    const displayFormsMap = {
        get: (ref: any) =>
            catalogHit && ref?.identifier === "ca1" ? computedAttributeDisplayForm : undefined,
    };

    return runSaga(
        {
            dispatch: () => {},
            getState: () => ({}),
            channel: undefined as any,
            effectMiddlewares: [
                (next: any) => (effect: any) => {
                    if (effect?.type === "SELECT") {
                        if (effect.payload.selector === selectAllCatalogDisplayFormsMap) {
                            return next({
                                ...effect,
                                payload: { ...effect.payload, selector: () => displayFormsMap },
                            });
                        }
                        if (effect.payload.selector === selectCatalogDateAttributes) {
                            return next({ ...effect, payload: { ...effect.payload, selector: () => [] } });
                        }
                    }
                    return next(effect);
                },
            ],
        },
        saga,
        ...args,
    ).toPromise();
}

const URL = "https://example.com/?q={attribute_title(computed_attribute/ca1)}";
const EXPECTED = [{ toBeReplaced: "{attribute_title(computed_attribute/ca1)}", replacement: "High" }];

describe("getAttributeIdentifiersReplacements", () => {
    it("resolves a computed attribute placeholder from the catalog", async () => {
        const { ctx, getAttributeDisplayForms, getComputedAttribute } = createContext("High");

        const replacements = await run(
            getAttributeIdentifiersReplacements,
            true,
            URL,
            intersection("ca1", "high"),
            ctx,
        );

        expect(replacements).toEqual(EXPECTED);
        // the catalog already had it, so nothing needs loading
        expect(getAttributeDisplayForms).not.toHaveBeenCalled();
        expect(getComputedAttribute).not.toHaveBeenCalled();
    });

    it("resolves a computed attribute the catalog does not carry", async () => {
        // A computed attribute excluded from the catalog by tags, or created after the dashboard was
        // initialised, still turns up in the drill intersection and has to resolve.
        const { ctx, getAttributeDisplayForms, getComputedAttribute } = createContext("High");

        const replacements = await run(
            getAttributeIdentifiersReplacements,
            false,
            URL,
            intersection("ca1", "high"),
            ctx,
        );

        expect(replacements).toEqual(EXPECTED);
        // it must be loaded through the computedAttributes service, never asked for as a label
        expect(getComputedAttribute).toHaveBeenCalledWith(idRef("ca1", "computedAttribute"));
        expect(getAttributeDisplayForms).not.toHaveBeenCalled();
    });
});
