// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";
import { type AttributeDisplayFormType } from "@gooddata/sdk-model";

import { convertLabelType } from "../fromBackend/LabelTypeConverter.js";

const mapping: [JsonApiLabelOutAttributesValueTypeEnum, AttributeDisplayFormType][] = [
    ["HYPERLINK", "GDC.link"],
    ["GEO", "GDC.geo.pin"],
    ["GEO_LATITUDE", "GDC.geo.pin_latitude"],
    ["GEO_LONGITUDE", "GDC.geo.pin_longitude"],
];

describe("LabelTypeConverter", () => {
    it.each(mapping)(" convertLabelType(%s).toBe(%s)", (tigerType, modelType) => {
        expect(convertLabelType(tigerType)).toBe(modelType);
    });
});
