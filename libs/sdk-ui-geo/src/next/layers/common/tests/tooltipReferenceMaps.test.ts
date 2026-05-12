// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDescriptor,
    type IMeasure,
    idRef,
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
} from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import { buildTooltipReferenceMaps } from "../tooltipReferenceMaps.js";

function dataViewWith(measures: IMeasure[], descriptors: IAttributeDescriptor[]): DataViewFacade {
    return {
        definition: { measures },
        meta: () => ({
            attributeDescriptors: () => descriptors,
        }),
    } as unknown as DataViewFacade;
}

const attributeDescriptor = (
    displayFormId: string,
    attributeId: string | undefined,
    overrides: Partial<IAttributeDescriptor["attributeHeader"]> = {},
): IAttributeDescriptor =>
    ({
        attributeHeader: {
            uri: `/gdc/md/${displayFormId}`,
            identifier: displayFormId,
            localIdentifier: "loc",
            ref: idRef(displayFormId, "displayForm"),
            name: "Attr",
            primaryLabel: idRef(displayFormId, "displayForm"),
            formOf: attributeId
                ? {
                      ref: idRef(attributeId, "attribute"),
                      uri: `/gdc/md/${attributeId}`,
                      identifier: attributeId,
                      name: "Attr",
                  }
                : undefined,
            ...overrides,
        },
    }) as unknown as IAttributeDescriptor;

describe("buildTooltipReferenceMaps", () => {
    it("maps simple measures by localIdentifier → LDM identifier", () => {
        const m = newMeasure("ldm.sales", (b) => b.localId("m_sales"));
        const maps = buildTooltipReferenceMaps(dataViewWith([m], []));
        expect(maps.measures).toEqual({ m_sales: "ldm.sales" });
    });

    it("resolves derived (PoP) measures to the master simple measure's LDM id", () => {
        const master = newMeasure("ldm.sales", (b) => b.localId("m_master"));
        const pop = newPopMeasure("m_master", "attr.year", (b) => b.localId("m_pop"));
        const maps = buildTooltipReferenceMaps(dataViewWith([master, pop], []));
        expect(maps.measures).toEqual({
            m_master: "ldm.sales",
            m_pop: "ldm.sales",
        });
    });

    it("skips arithmetic measures (no LDM identifier)", () => {
        const a = newMeasure("ldm.a", (b) => b.localId("a"));
        const b = newMeasure("ldm.b", (b) => b.localId("b"));
        const arith = newArithmeticMeasure(["a", "b"], "sum", (b) => b.localId("arith"));
        const maps = buildTooltipReferenceMaps(dataViewWith([a, b, arith], []));
        expect(maps.measures).toEqual({ a: "ldm.a", b: "ldm.b" });
        expect(maps.measures).not.toHaveProperty("arith");
    });

    it("maps display-form identifier → parent attribute identifier", () => {
        const desc = attributeDescriptor("df.country", "attr.country");
        const maps = buildTooltipReferenceMaps(dataViewWith([], [desc]));
        expect(maps.attributes).toEqual({ "df.country": "attr.country" });
    });

    it("falls back to URI when the display-form has no identifier", () => {
        const desc = attributeDescriptor("df.country", "attr.country", {
            identifier: undefined,
            uri: "/gdc/md/df.country",
        });
        const maps = buildTooltipReferenceMaps(dataViewWith([], [desc]));
        expect(maps.attributes).toEqual({ "/gdc/md/df.country": "attr.country" });
    });

    it("skips attributes without a parent attribute identifier", () => {
        const desc = attributeDescriptor("df.country", undefined);
        const maps = buildTooltipReferenceMaps(dataViewWith([], [desc]));
        expect(maps.attributes).toEqual({});
    });
});
