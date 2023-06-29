// (C) 2021-2023 GoodData Corporation
import { JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";
import { AttributeDisplayFormType } from "@gooddata/sdk-model";
import { convertLabelType } from "../fromBackend/LabelTypeConverter.js";
import { describe, expect, test } from "vitest";

const mapping: [JsonApiLabelOutAttributesValueTypeEnum, AttributeDisplayFormType][] = [
    [JsonApiLabelOutAttributesValueTypeEnum.HYPERLINK, "GDC.link"],
    [JsonApiLabelOutAttributesValueTypeEnum.GEO, "GDC.geo.pin"],
    [JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE, "GDC.geo.pin_latitude"],
    [JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE, "GDC.geo.pin_longitude"],
];

describe("LabelTypeConverter", () => {
    test.each(mapping)(" convertLabelType(%s).toBe(%s)", (tigerType, modelType) => {
        expect(convertLabelType(tigerType)).toBe(modelType);
    });
});
