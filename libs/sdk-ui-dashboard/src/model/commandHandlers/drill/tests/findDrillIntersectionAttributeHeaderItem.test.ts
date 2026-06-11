// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAttributeDisplayFormMetadataObject, type ObjRef, idRef, uriRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import { findDrillIntersectionAttributeHeaderItem } from "../resolveDrillToCustomUrl.js";

// Minimal shape of the attribute descriptor the matcher reads; the element is cast to the full type.
interface ITestAttributeHeader {
    uri: string;
    identifier: string;
    localIdentifier: string;
    name: string;
    ref: ObjRef;
    formOf: { ref: ObjRef; identifier: string; uri: string; name: string };
}

/**
 * The placeholder `{attribute_title(report_id)}` resolves a display form by identifier ("report_id").
 * The display-form metadata comes from the metadata API; the drill intersection comes from the
 * execution result. The two can represent the same object with refs that differ in shape/type, which
 * used to make the strict ref comparison fail and break drill-to-URL with "Failed to load URL".
 */
function reportIdDisplayForm(): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        id: "report_id",
        uri: "/metadata/report_id",
        ref: idRef("report_id", "displayForm"),
        title: "Report ID",
        description: "",
        attribute: idRef("report_id.attr", "attribute"),
        production: true,
        deprecated: false,
        unlisted: false,
    };
}

function intersectionElement(
    attributeHeader: ITestAttributeHeader,
    value: string,
): IDrillEventIntersectionElement {
    return {
        header: {
            attributeHeader,
            attributeHeaderItem: { uri: value, name: value },
        },
    } as unknown as IDrillEventIntersectionElement;
}

// Builds an attribute descriptor (as a column emits in the execution result) for the given
// display-form and parent-attribute identifiers.
function attrHeader(dfId: string, attrId: string): ITestAttributeHeader {
    return {
        uri: `/execution/${dfId}`,
        identifier: dfId,
        localIdentifier: `a_${dfId}`,
        name: dfId,
        ref: idRef(dfId, "displayForm"),
        formOf: { ref: idRef(attrId, "attribute"), identifier: attrId, uri: "", name: dfId },
    };
}

function displayForm(
    overrides: Partial<IAttributeDisplayFormMetadataObject> = {},
): IAttributeDisplayFormMetadataObject {
    return { ...reportIdDisplayForm(), ...overrides };
}

describe("findDrillIntersectionAttributeHeaderItem", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("matches by display-form identifier even when the intersection refs differ in shape (the CN regression)", () => {
        // Same display form ("report_id"), but the execution result reports it as uriRefs while the
        // metadata uses idRefs — strict areObjRefsEqual would return false here.
        const intersection = [
            intersectionElement(
                {
                    uri: "/execution/report_id",
                    identifier: "report_id",
                    localIdentifier: "a_report_id",
                    name: "Report ID",
                    ref: uriRef("/execution/report_id"),
                    formOf: {
                        ref: uriRef("/execution/report_id.attr"),
                        identifier: "report_id.attr",
                        uri: "/execution/report_id.attr",
                        name: "Report ID",
                    },
                },
                "670030448",
            ),
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())).toEqual({
            uri: "670030448",
            name: "670030448",
        });
        // Tripwire: the strict attribute-ref comparison would have failed here, so the tolerant match
        // must warn that the execution result and metadata disagree on the attribute reference.
        expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("matches by parent attribute when the column uses a different label of the same attribute", () => {
        // Different display form id, but same parent attribute — and the intersection omits the
        // ref `type`, which strict comparison would normally still resolve by identifier.
        const intersection = [
            intersectionElement(
                {
                    uri: "/execution/report_label_2",
                    identifier: "report_label_2",
                    localIdentifier: "a_report",
                    name: "Report ID",
                    ref: idRef("report_label_2", "displayForm"),
                    formOf: {
                        ref: idRef("report_id.attr"),
                        identifier: "report_id.attr",
                        uri: "",
                        name: "Report ID",
                    },
                },
                "670030448",
            ),
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())?.uri).toBe(
            "670030448",
        );
    });

    it("still matches the original happy path (identical idRefs)", () => {
        const intersection = [
            intersectionElement(
                {
                    uri: "/execution/report_id",
                    identifier: "report_id",
                    localIdentifier: "a_report_id",
                    name: "Report ID",
                    ref: idRef("report_id", "displayForm"),
                    formOf: {
                        ref: idRef("report_id.attr", "attribute"),
                        identifier: "report_id.attr",
                        uri: "",
                        name: "Report ID",
                    },
                },
                "670030448",
            ),
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())?.uri).toBe(
            "670030448",
        );
        // Strict attribute-ref comparison matches here, so the tripwire must stay silent.
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("returns undefined when no intersection element matches the placeholder's attribute", () => {
        const intersection = [
            intersectionElement(
                {
                    uri: "/execution/unrelated",
                    identifier: "unrelated",
                    localIdentifier: "a_unrelated",
                    name: "Unrelated",
                    ref: idRef("unrelated", "displayForm"),
                    formOf: {
                        ref: idRef("unrelated.attr", "attribute"),
                        identifier: "unrelated.attr",
                        uri: "",
                        name: "Unrelated",
                    },
                },
                "x",
            ),
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())).toBeUndefined();
    });

    it("resolves each placeholder to its own element when several distinct attributes are present", () => {
        // A drilled row carries multiple attributes; each placeholder must pick its own element and
        // not steal a neighbour's value.
        const intersection = [
            intersectionElement(attrHeader("report_id", "report_id.attr"), "670030448"),
            intersectionElement(attrHeader("status", "status.attr"), "Closed"),
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())?.uri).toBe(
            "670030448",
        );
        expect(
            findDrillIntersectionAttributeHeaderItem(
                intersection,
                displayForm({
                    id: "status",
                    ref: idRef("status", "displayForm"),
                    attribute: idRef("status.attr", "attribute"),
                }),
            )?.uri,
        ).toBe("Closed");
    });

    it("resolves two labels of the same attribute to the element present in the intersection", () => {
        // Only the "report_id" label is in the intersection; "report_name" is another label of the
        // same parent attribute. The displayed label matches by identifier, the other resolves via the
        // parent-attribute fallback — both to the one present element.
        const intersection = [intersectionElement(attrHeader("report_id", "report_id.attr"), "670030448")];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())?.uri).toBe(
            "670030448",
        );
        expect(
            findDrillIntersectionAttributeHeaderItem(
                intersection,
                displayForm({
                    id: "report_name",
                    ref: idRef("report_name", "displayForm"),
                    attribute: idRef("report_id.attr", "attribute"),
                }),
            )?.uri,
        ).toBe("670030448");
    });

    it("ignores measure descriptors in the intersection", () => {
        const intersection = [
            {
                header: {
                    measureHeaderItem: { name: "Amount", localIdentifier: "m1", format: "#" },
                },
            } as unknown as IDrillEventIntersectionElement,
        ];

        expect(findDrillIntersectionAttributeHeaderItem(intersection, reportIdDisplayForm())).toBeUndefined();
    });
});
