// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ResultDimension } from "@gooddata/api-client-tiger";
import {
    MeasureGroupIdentifier,
    defWithDimensions,
    emptyDef,
    idRef,
    newAttribute,
    newDefForItems,
    newDimension,
    newMeasure,
    newTotal,
} from "@gooddata/sdk-model";

import { transformResultDimensions } from "./dimensions.js";
import { mockDimensions, mockGeoAreaDimensions, mockMultipleDimensions } from "./dimensions.test.helpers.js";

describe("transformResultDimensions", () => {
    it("should fill in uris and refs for attribute descriptors", () => {
        expect(transformResultDimensions(mockDimensions, emptyDef("test"))).toMatchSnapshot();
    });

    it("should fill in uris and refs for attribute descriptors and simple measure descriptors", () => {
        expect(
            transformResultDimensions(
                mockDimensions,
                newDefForItems("test", [
                    newMeasure(idRef("measureIdentifier", "measure"), (m) => m.localId("measureLocalId")),
                ]),
            ),
        ).toMatchSnapshot();
    });

    const Total1 = newTotal("sum", "measureLocalId", "localAttr1");
    const Subtotal1 = newTotal("sum", "measureLocalId", "localAttr2");
    const Total2 = newTotal("max", "measureLocalId", "localAttr3");

    it("should fill in totals", () => {
        const TotalDef = defWithDimensions(
            emptyDef("test"),
            newDimension(["localAttr1", "localAttr2"], [Total1, Subtotal1]),
            newDimension([MeasureGroupIdentifier]),
            newDimension(["localAttr3"], [Total2]),
        );
        expect(transformResultDimensions(mockMultipleDimensions, TotalDef)).toMatchSnapshot();
    });

    it("should fill in totals with multiple totals of the same type on one attribute (RAIL-3246)", () => {
        // same attribute and type as Total2, different measure
        const Total3 = newTotal("max", "measureLocalId2", "localAttr3");
        const TotalDef = defWithDimensions(
            emptyDef("test"),
            newDimension(["localAttr1", "localAttr2"], [Total1, Subtotal1]),
            newDimension([MeasureGroupIdentifier]),
            newDimension(["localAttr3"], [Total2, Total3]),
        );
        expect(transformResultDimensions(mockMultipleDimensions, TotalDef)).toMatchSnapshot();
    });

    it("should pass geo area configuration through attribute descriptors", () => {
        const [geoDimension] = transformResultDimensions(mockGeoAreaDimensions, emptyDef("test"));
        expect(geoDimension.headers[0]).toMatchObject({
            attributeHeader: {
                geoAreaConfig: {
                    collectionId: "regions",
                },
            },
        });
    });

    it("should keep the computedAttribute ref type on computed attribute descriptors", () => {
        const computedAttributeDimensions: ResultDimension[] = [
            {
                headers: [
                    {
                        attributeHeader: {
                            label: { id: "ca_1", type: "label" },
                            localIdentifier: "caLocal",
                            labelName: "Computed",
                            primaryLabel: { id: "ca_1", type: "label" },
                            attribute: { id: "ca_1", type: "attribute" },
                            attributeName: "Computed",
                            valueType: "TEXT",
                        },
                    },
                ],
                localIdentifier: "headers1",
            },
        ];
        const def = newDefForItems("test", [
            newAttribute(idRef("ca_1", "computedAttribute"), (a) => a.localId("caLocal")),
        ]);

        const [dimension] = transformResultDimensions(computedAttributeDimensions, def);

        expect(dimension.headers[0]).toMatchObject({
            attributeHeader: {
                ref: idRef("ca_1", "computedAttribute"),
                primaryLabel: idRef("ca_1", "computedAttribute"),
                formOf: {
                    ref: idRef("ca_1", "computedAttribute"),
                },
            },
        });
    });
});
