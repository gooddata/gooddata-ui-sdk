// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type IInsight,
    idRef,
    newAttribute,
    newBucket,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import { insightsAdapter } from "./insightsEntityAdapter.js";
import {
    selectRawExportOverridesForInsight,
    selectRawExportOverridesForInsightByRef,
} from "./insightsSelectors.js";

const displayForm = (
    id: string,
    type: "displayForm" | "computedAttribute",
    attributeId: string,
): IAttributeDisplayFormMetadataObject => ({
    type: "displayForm",
    ref: idRef(id, type),
    id,
    uri: id,
    title: `${id} title`,
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    attribute: idRef(attributeId, type === "displayForm" ? "attribute" : "computedAttribute"),
});

const attribute = (id: string, title: string): ICatalogAttribute => ({
    type: "attribute",
    attribute: {
        type: "attribute",
        ref: idRef(id, "attribute"),
        id,
        uri: id,
        title,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [displayForm(`${id}.label`, "displayForm", id)],
    },
    defaultDisplayForm: displayForm(`${id}.label`, "displayForm", id),
    displayForms: [displayForm(`${id}.label`, "displayForm", id)],
    geoPinDisplayForms: [],
    groups: [],
});

const computedAttribute = (id: string, title: string): ICatalogComputedAttribute => ({
    type: "computedAttribute",
    computedAttribute: {
        type: "computedAttribute",
        ref: idRef(id, "computedAttribute"),
        id,
        uri: id,
        title,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        expression: "SELECT 1",
        displayForms: [displayForm(id, "computedAttribute", id)],
    },
    defaultDisplayForm: displayForm(id, "computedAttribute", id),
    displayForms: [displayForm(id, "computedAttribute", id)],
    groups: [],
});

const insightWith = (caAlias?: string): IInsight => ({
    insight: {
        ...newInsightDefinition("local:table", (b) =>
            b.buckets([
                newBucket(
                    "attribute",
                    newAttribute(idRef("account.label", "displayForm"), (a) => a.localId("a_1")),
                ),
                newBucket(
                    "columns",
                    newAttribute(idRef("ca_1", "computedAttribute"), (a) => {
                        a.localId("a_ca");
                        return caAlias ? a.alias(caAlias) : a;
                    }),
                ),
            ]),
        ).insight,
        ref: idRef("insight_1"),
        identifier: "insight_1",
        uri: "insight_1",
    },
});

const state: any = {
    catalog: {
        attributes: [attribute("account", "Account")],
        computedAttributes: [computedAttribute("ca_1", "Bucketed accounts")],
        dateDatasets: [],
        measures: [],
    },
    config: { config: {} },
    backendCapabilities: { backendCapabilities: { hasTypeScopedIdentifiers: false } },
    insights: insightsAdapter.setAll(insightsAdapter.getInitialState(), [insightWith()]),
};

describe("raw export display form overrides", () => {
    it("uses the catalog display form title for a normal attribute", () => {
        const overrides = selectRawExportOverridesForInsight(insightWith())(state);

        expect(overrides?.displayForms?.["a_1"]).toEqual({ title: "account.label title" });
    });

    it("uses the computed attribute display form title when there is no alias", () => {
        const overrides = selectRawExportOverridesForInsight(insightWith())(state);

        expect(overrides?.displayForms?.["a_ca"]).toEqual({ title: "ca_1 title" });
    });

    it("prefers the alias over the computed attribute title", () => {
        const overrides = selectRawExportOverridesForInsight(insightWith("My alias"))(state);

        expect(overrides?.displayForms?.["a_ca"]).toEqual({ title: "My alias" });
    });

    it("resolves the computed attribute title for an insight reference", () => {
        const overrides = selectRawExportOverridesForInsightByRef(idRef("insight_1"))(state);

        expect(overrides?.displayForms?.["a_ca"]).toEqual({ title: "ca_1 title" });
    });

    it("prefers the alias for an insight reference", () => {
        const withAlias = {
            ...state,
            insights: insightsAdapter.setAll(insightsAdapter.getInitialState(), [insightWith("My alias")]),
        };

        const overrides = selectRawExportOverridesForInsightByRef(idRef("insight_1"))(withAlias);

        expect(overrides?.displayForms?.["a_ca"]).toEqual({ title: "My alias" });
    });
});
