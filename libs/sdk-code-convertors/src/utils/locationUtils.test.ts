// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AttributeField } from "@gooddata/sdk-code-schemas/v1";

import { type ExportEntities } from "../types.js";

import { mapLocationLabel } from "./locationUtils.js";

describe("mapLocationLabel", () => {
    it("should return original displayForm if no entities are provided", () => {
        const entities: ExportEntities = [];
        const field: AttributeField = { using: "label/label_id" };
        const result = mapLocationLabel(entities, field);
        expect(result).toEqual({
            displayForm: {
                identifier: {
                    id: "label_id",
                    type: "label",
                },
            },
        });
    });

    it("should return original displayForm if field is not found in datasets", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        other_field: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                other_label: { title: "Other Label" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "label/my_label" };
        const result = mapLocationLabel(entities, field);
        expect(result.displayForm?.identifier.id).toBe("my_label");
        expect(result.latitude).toBeUndefined();
    });

    it("should return location labels when field matches attribute identifier", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                lat_label: { title: "Lat", value_type: "GEO_LATITUDE" },
                                long_label: { title: "Long", value_type: "GEO_LONGITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "attribute/attr_id" };
        const result = mapLocationLabel(entities, field);
        expect(result).toEqual({
            displayForm: {
                identifier: {
                    id: "lat_label",
                    type: "label",
                },
            },
            latitude: "lat_label",
            longitude: "long_label",
        });
    });

    it("should return location labels when field matches one of the labels", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                some_label: { title: "Some Label" },
                                lat_label: { title: "Lat", value_type: "GEO_LATITUDE" },
                                long_label: { title: "Long", value_type: "GEO_LONGITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "label/some_label" };
        const result = mapLocationLabel(entities, field);
        expect(result).toEqual({
            displayForm: {
                identifier: {
                    id: "lat_label",
                    type: "label",
                },
            },
            latitude: "lat_label",
            longitude: "long_label",
        });
    });

    it("should return only latitude if longitude is missing", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                lat_label: { title: "Lat", value_type: "GEO_LATITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "attribute/attr_id" };
        const result = mapLocationLabel(entities, field);
        expect(result).toEqual({
            displayForm: {
                identifier: {
                    id: "lat_label",
                    type: "label",
                },
            },
            latitude: "lat_label",
            longitude: undefined,
        });
    });

    it("should return original displayForm if GEO_LATITUDE is missing but GEO_LONGITUDE is present", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                long_label: { title: "Long", value_type: "GEO_LONGITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "attribute/attr_id" };
        const result = mapLocationLabel(entities, field);
        expect(result.latitude).toBeUndefined();
        expect(result.displayForm?.identifier.id).toBe("attr_id");
    });

    it("should return null displayForm if createIdentifier returns null (e.g. invalid 'using')", () => {
        const entities: ExportEntities = [];
        const field: AttributeField = { using: "invalid-string" };
        const result = mapLocationLabel(entities, field);
        expect(result.displayForm).toBeNull();
    });

    it("should find the field even if it's in a subsequent dataset", () => {
        const entities: ExportEntities = [
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: { id: "ds1", type: "dataset", fields: {} } as any,
            },
            {
                id: "ds2",
                type: "dataset",
                path: "ds2.yaml",
                data: {
                    id: "ds2",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                lat_label: { title: "Lat", value_type: "GEO_LATITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "attribute/attr_id" };
        const result = mapLocationLabel(entities, field);
        expect(result.latitude).toBe("lat_label");
    });

    it("should ignore non-dataset entities", () => {
        const entities: ExportEntities = [
            {
                id: "m1",
                type: "metric",
                path: "m1.yaml",
                data: { id: "m1", type: "metric" } as any,
            },
            {
                id: "ds1",
                type: "dataset",
                path: "ds1.yaml",
                data: {
                    id: "ds1",
                    type: "dataset",
                    fields: {
                        attr_id: {
                            type: "attribute",
                            data_type: "STRING",
                            labels: {
                                lat_label: { title: "Lat", value_type: "GEO_LATITUDE" },
                            },
                        },
                    },
                } as any,
            },
        ];
        const field: AttributeField = { using: "attribute/attr_id" };
        const result = mapLocationLabel(entities, field);
        expect(result.latitude).toBe("lat_label");
    });
});
