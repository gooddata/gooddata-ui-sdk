// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

import { type TooltipPayload, dedupeAttributePayloads } from "./tooltipUtils.js";

const payload = (title: string, value: string, attrId: string, attrLocalId?: string): TooltipPayload => ({
    title,
    value,
    attrId,
    attrLocalId,
});

const label = (displayFormId: string) => ({
    displayFormKey: `label/${displayFormId}`,
    attributeKey: `label/${displayFormId}`,
});
const computedAttribute = (id: string) => ({
    displayFormKey: `computed_attribute/${id}`,
    attributeKey: `computed_attribute/${id}`,
});

describe("dedupeAttributePayloads", () => {
    it("keeps only the first payload when the same label is used as location and as segment", () => {
        // Two buckets, two localIdentifiers, one display form: the tooltip must show it once.
        const location = payload("City", "Prague", "city.name", "a_location");
        const segment = payload("City", "Prague", "city.name", "a_segment");
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { a_location: label("city.name"), a_segment: label("city.name") },
        };

        expect(dedupeAttributePayloads([location, segment], maps)).toEqual([location, undefined]);
    });

    it("keeps a label and a computed attribute apart when they share an identifier", () => {
        const labelPayload = payload("Tier label", "Silver", "tier", "a_label");
        const computedPayload = payload("Tier CA", "Gold", "tier", "a_ca");
        const maps: ITooltipReferenceMaps = {
            measures: {},
            attributes: { a_label: label("tier"), a_ca: computedAttribute("tier") },
        };

        expect(dedupeAttributePayloads([labelPayload, computedPayload], maps)).toEqual([
            labelPayload,
            computedPayload,
        ]);
    });

    it("falls back to the label namespace of attrId when the maps cannot place a payload", () => {
        const location = payload("City", "Prague", "city.name");
        const segment = payload("City", "Prague", "city.name", "a_segment");

        expect(dedupeAttributePayloads([location, segment], undefined)).toEqual([location, undefined]);
    });

    it("passes through payloads without attrId and undefined slots untouched", () => {
        const noAttr: TooltipPayload = { title: "Size", value: 3 };

        expect(dedupeAttributePayloads([undefined, noAttr, undefined], undefined)).toEqual([
            undefined,
            noAttr,
            undefined,
        ]);
    });
});
