// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type DashboardAttributeFilterItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    idRef,
} from "@gooddata/sdk-model";

import { findAttributeFilterCounterpart } from "../attributeFilterMatching.js";

const nameDisplayForm = idRef("region.name", "displayForm");
const codeDisplayForm = idRef("region.code", "displayForm");

function listFilter(localIdentifier: string): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm: nameDisplayForm,
            localIdentifier,
            negativeSelection: false,
            attributeElements: { uris: [] },
        },
    };
}

function textFilter(localIdentifier: string): DashboardAttributeFilterItem {
    return {
        arbitraryAttributeFilter: {
            displayForm: codeDisplayForm,
            localIdentifier,
            negativeSelection: false,
            values: [],
        },
    };
}

function displayFormMetadata(id: string, attributeId: string): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        id,
        uri: `/${id}`,
        ref: idRef(id, "displayForm"),
        title: id,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef(attributeId, "attribute"),
    };
}

const displayForms = [
    displayFormMetadata("region.name", "region"),
    displayFormMetadata("region.code", "region"),
];

describe("findAttributeFilterCounterpart", () => {
    it("matches list and text filters through their owning attribute", () => {
        const target = textFilter("target");

        expect(
            findAttributeFilterCounterpart(listFilter("source"), [target], {
                displayForms,
            }),
        ).toEqual({ status: "matched", counterpart: target });
    });

    it("reports an incompatible list-to-text migration", () => {
        const target = textFilter("target");

        expect(
            findAttributeFilterCounterpart(listFilter("source"), [target], {
                displayForms,
                targetFilterConfigs: [{ localIdentifier: "target", selectionType: "text" }],
            }),
        ).toEqual({ status: "notCompatible", counterpart: target });
    });

    it("reports an incompatible text-to-list migration", () => {
        const target = listFilter("target");

        expect(
            findAttributeFilterCounterpart(textFilter("source"), [target], {
                displayForms,
                targetFilterConfigs: [{ localIdentifier: "target", selectionType: "list" }],
            }),
        ).toEqual({ status: "notCompatible", counterpart: target });
    });

    it("uses display-as-label configuration in either direction", () => {
        const target = listFilter("target");

        expect(
            findAttributeFilterCounterpart({ displayForm: codeDisplayForm, type: "text" }, [target], {
                targetFilterConfigs: [
                    {
                        localIdentifier: "target",
                        displayAsLabel: codeDisplayForm,
                        selectionType: "listOrText",
                    },
                ],
            }),
        ).toEqual({ status: "matched", counterpart: target });
    });

    it("matches text filters only on the same display form", () => {
        const target = textFilter("target");

        expect(
            findAttributeFilterCounterpart(textFilter("source"), [target], {
                displayForms,
            }),
        ).toEqual({ status: "matched", counterpart: target });
    });

    it("does not match text filters on different display forms of the same attribute", () => {
        const source = {
            arbitraryAttributeFilter: {
                displayForm: nameDisplayForm,
                localIdentifier: "source",
                negativeSelection: false,
                values: ["West"],
            },
        };

        expect(
            findAttributeFilterCounterpart(source, [textFilter("target")], {
                displayForms,
                attributesWithReferences: [
                    {
                        attribute: {
                            type: "attribute",
                            id: "region",
                            uri: "/region",
                            ref: idRef("region", "attribute"),
                            title: "region",
                            description: "",
                            production: true,
                            deprecated: false,
                            unlisted: false,
                            displayForms,
                        },
                    },
                ],
            }),
        ).toEqual({ status: "notFound" });
    });

    it("does not migrate list filters when list-to-text migration is disabled", () => {
        expect(
            findAttributeFilterCounterpart(listFilter("source"), [textFilter("target")], {
                displayForms,
                allowListToText: false,
            }),
        ).toEqual({ status: "notFound" });
    });
});
