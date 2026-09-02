// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IConditionalFormatting, newAttributeSort, newInsightDefinition } from "@gooddata/sdk-model";
import { type ColumnWidthItem } from "@gooddata/sdk-ui-pivot";

import { OPTIONAL_STACKING_PROPERTIES } from "../constants/supportedProperties.js";
import {
    type IBucketItem,
    type IExtendedReferencePoint,
    type IVisualizationProperties,
} from "../interfaces/Visualization.js";
import {
    emptyReferencePoint,
    measuresOnSecondaryAxisAndAttributeReferencePoint,
    oneMetricAndCategoryAndStackReferencePoint,
    simpleStackedReferencePoint,
    twoMeasureBucketsReferencePoint,
} from "../tests/referencePointMocks.test.helpers.js";

import {
    getColumnWidthsFromProperties,
    getConditionalFormattingFromProperties,
    getEffectiveConditionalFormatting,
    getHighchartsAxisNameConfiguration,
    getReferencePointWithSupportedProperties,
    getSupportedProperties,
    getSupportedPropertiesControls,
    isDualAxisOrSomeSecondaryAxisMeasure,
    isSemanticConditionalFormattingEnabled,
    removeImmutableOptionalStackingProperties,
} from "./propertiesHelper.js";
import {
    multipleMetricsAndCategoriesBaseUiConfig,
    simpleStackedBaseUiConfig,
} from "./uiConfigMocks.test.helpers.js";

describe("propertiesHelper", () => {
    describe("getSupportedPropertiesControls", () => {
        const defaultControls = {
            propA: {
                foo: "bar",
                bar: "foo",
            },
            propB: {
                foo: "bar",
            },
            foo: "bar",
        };

        it("should return empty object if no supported properties list is defined", () => {
            expect(getSupportedPropertiesControls(undefined, undefined)).toEqual({});
        });

        it("should return empty object when supported properties list is empty", () => {
            expect(getSupportedPropertiesControls(defaultControls, [])).toEqual({});
        });

        it("should return every property if highest level is defined", () => {
            const supportedPropertiesList = ["propA", "propB", "foo"];

            expect(getSupportedPropertiesControls(defaultControls, supportedPropertiesList)).toEqual(
                defaultControls,
            );
        });

        it("should return only properties parts which are defined in supported properties list", () => {
            const supportedPropertiesList = ["propA.foo", "foo"];

            const expectedSupportedProperties = {
                propA: {
                    foo: "bar",
                },
                foo: "bar",
            };

            expect(getSupportedPropertiesControls(defaultControls, supportedPropertiesList)).toEqual(
                expectedSupportedProperties,
            );
        });
    });

    describe("getSupportedProperties", () => {
        it("should return empty object when properties are null", () => {
            const result = getSupportedProperties(undefined, []);
            expect(result).toEqual({});
        });

        it("should return empty object when properties do not have controls", () => {
            const result = getSupportedProperties({}, []);
            expect(result).toEqual({});
        });

        it("should return object with only supported controls", () => {
            const properties = {
                controls: {
                    supported: "abc",
                    unsupported: "xyz",
                },
            };
            const supported = ["supported"];

            const expected = {
                controls: {
                    supported: "abc",
                },
            };

            const result = getSupportedProperties(properties, supported);

            expect(result).toEqual(expected);
        });
    });

    describe("getReferencePointWithSupportedProperties", () => {
        it("should return reference point with pith properties with only sort items", () => {
            const sortItem = newAttributeSort("a");
            const referencePoint = {
                ...emptyReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
                properties: {
                    sortItems: [sortItem],
                    controls: {},
                },
            };
            const expected = {
                ...emptyReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
                properties: {
                    sortItems: [sortItem],
                },
            };

            const result = getReferencePointWithSupportedProperties(referencePoint, []);

            expect(result).toEqual(expected);
        });

        it("should return properties with controls", () => {
            const referencePoint = {
                ...emptyReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
                properties: {
                    controls: {
                        testProperty: "value",
                    },
                },
            };
            const expected = referencePoint;

            const result = getReferencePointWithSupportedProperties(referencePoint, ["testProperty"]);

            expect(result).toEqual(expected);
        });
    });

    describe("removeImmutableOptionalStackingProperties", () => {
        it("should remove both stackMeasures and stackMeasuresToPercent when all bucket is empty", () => {
            const extendedReferencePoint = {
                ...emptyReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
            };
            const result = removeImmutableOptionalStackingProperties(
                extendedReferencePoint,
                OPTIONAL_STACKING_PROPERTIES,
            );
            expect(result).toEqual([]);
        });

        it("should remove both stackMeasures and keep stackMeasuresToPercent when stack attribute existed", () => {
            const extendedReferencePoint = {
                ...simpleStackedReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
            };
            const result = removeImmutableOptionalStackingProperties(
                extendedReferencePoint,
                OPTIONAL_STACKING_PROPERTIES,
            );
            expect(result).toEqual(["stackMeasuresToPercent"]);
        });

        it("should keep both stackMeasures and stackMeasuresToPercent when have many measures", () => {
            const extendedReferencePoint: IExtendedReferencePoint = {
                ...twoMeasureBucketsReferencePoint,
                uiConfig: multipleMetricsAndCategoriesBaseUiConfig,
            };
            const result = removeImmutableOptionalStackingProperties(
                extendedReferencePoint,
                OPTIONAL_STACKING_PROPERTIES,
            );
            expect(result).toEqual(OPTIONAL_STACKING_PROPERTIES);
        });
    });

    describe("isDualAxisOrSomeSecondaryAxisMeasure", () => {
        it("should return true if dualAxis is false but secondary measure item has showOnSecondaryAxis", () => {
            const extendedReferencePoint: IExtendedReferencePoint = {
                ...measuresOnSecondaryAxisAndAttributeReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
                properties: {
                    controls: {
                        dualAxis: false,
                    },
                },
            };

            const secondaryMeasures: IBucketItem[] = [
                {
                    localIdentifier: "item1",
                    showOnSecondaryAxis: false,
                },
                {
                    localIdentifier: "item2",
                    showOnSecondaryAxis: true,
                },
            ];

            expect(isDualAxisOrSomeSecondaryAxisMeasure(extendedReferencePoint, secondaryMeasures)).toEqual(
                true,
            );
        });

        it("should return false if dualAxis is false or secondary measure item hasn't showOnSecondaryAxis", () => {
            const extendedReferencePoint: IExtendedReferencePoint = {
                ...oneMetricAndCategoryAndStackReferencePoint,
                uiConfig: simpleStackedBaseUiConfig,
                properties: {
                    controls: {
                        dualAxis: false,
                    },
                },
            };

            const secondaryMeasures: IBucketItem[] = [
                {
                    localIdentifier: "item1",
                    showOnSecondaryAxis: false,
                },
                {
                    localIdentifier: "item2",
                    showOnSecondaryAxis: false,
                },
            ];

            expect(isDualAxisOrSomeSecondaryAxisMeasure(extendedReferencePoint, secondaryMeasures)).toEqual(
                false,
            );
        });
    });

    describe("getHighchartsAxisNameConfiguration", () => {
        it("should return same control properties when there is no name config", () => {
            const controlsProp: IVisualizationProperties = {
                xaxis: {
                    visible: true,
                    min: 100,
                    max: 200,
                },
            };
            expect(getHighchartsAxisNameConfiguration(controlsProp)).toEqual(controlsProp);
        });

        it.each([
            ["middle", "auto"],
            ["low", "left"],
            ["middle", "center"],
            ["high", "right"],
            ["low", "bottom"],
            ["middle", "middle"],
            ["high", "top"],
        ])("should return '%s' position when AD value is '%s'", (hcValue: string, adValue: string) => {
            const controlsProp: IVisualizationProperties = {
                xaxis: {
                    name: {
                        position: adValue,
                    },
                },
            };

            const newControlsProp = getHighchartsAxisNameConfiguration(controlsProp);
            expect(newControlsProp).toEqual({
                xaxis: {
                    name: {
                        position: hcValue,
                    },
                },
            });
        });
    });

    describe("getColumnWidthsFromProperties", () => {
        const columnWidths: ColumnWidthItem[] = [
            {
                measureColumnWidthItem: {
                    width: { value: 100 },
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "id",
                            },
                        },
                    ],
                },
            },
        ];

        it("should return correct column widths", () => {
            const visualizationProperties: IVisualizationProperties = {
                controls: {
                    columnWidths,
                },
            };
            const result = getColumnWidthsFromProperties(visualizationProperties);
            expect(result).toEqual(columnWidths);
        });

        it("should return undefined when column widths are not defined", () => {
            const visualizationProperties: IVisualizationProperties = {
                properties: {
                    controls: {},
                },
            };
            const result = getColumnWidthsFromProperties(visualizationProperties);
            expect(result).toEqual(undefined);
        });
    });

    describe("getEffectiveConditionalFormatting", () => {
        const storedConditionalFormatting: IConditionalFormatting = { enabled: true, rules: [] };
        const overrideConditionalFormatting: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r1",
                    target: { kind: "measure", measureIdentifier: "m1" },
                    conditions: [],
                },
            ],
        };
        const insightWithStoredConditionalFormatting = newInsightDefinition("local:table", (builder) =>
            builder.properties({ controls: { conditionalFormatting: storedConditionalFormatting } }),
        );
        const insightWithNoConditionalFormatting = newInsightDefinition("local:table");
        const enabledSettings = { enableConditionalFormatting: true, enableNewPivotTable: true };
        const disabledSettings = { enableConditionalFormatting: false, enableNewPivotTable: true };

        it("returns the override when both an override and stored properties are present", () => {
            const result = getEffectiveConditionalFormatting(
                insightWithStoredConditionalFormatting,
                enabledSettings,
                overrideConditionalFormatting,
            );
            expect(result).toBe(overrideConditionalFormatting);
        });

        it("falls back to the insight's stored properties when there is no override", () => {
            const result = getEffectiveConditionalFormatting(
                insightWithStoredConditionalFormatting,
                enabledSettings,
            );
            expect(result).toEqual(storedConditionalFormatting);
        });

        it("returns undefined when the feature flag is off, even with an override", () => {
            const result = getEffectiveConditionalFormatting(
                insightWithStoredConditionalFormatting,
                disabledSettings,
                overrideConditionalFormatting,
            );
            expect(result).toBeUndefined();
        });

        it("returns undefined when the legacy (non-next) pivot table is in use, even with the flag on", () => {
            const result = getEffectiveConditionalFormatting(
                insightWithStoredConditionalFormatting,
                { enableConditionalFormatting: true, enableNewPivotTable: false },
                overrideConditionalFormatting,
            );
            expect(result).toBeUndefined();
        });

        it("returns undefined when there is neither an override nor stored properties", () => {
            const result = getEffectiveConditionalFormatting(
                insightWithNoConditionalFormatting,
                enabledSettings,
            );
            expect(result).toBeUndefined();
        });

        it("still applies CF when enableNewPivotTable is omitted, matching the routing factory's own default", () => {
            const result = getEffectiveConditionalFormatting(insightWithStoredConditionalFormatting, {
                enableConditionalFormatting: true,
            });
            expect(result).toEqual(storedConditionalFormatting);
        });
    });

    describe("getConditionalFormattingFromProperties", () => {
        it("returns the config as-is when it already carries suppressedTargets", () => {
            const visualizationProperties: IVisualizationProperties = {
                controls: {
                    conditionalFormatting: {
                        enabled: true,
                        rules: [],
                        suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
                    },
                },
            };
            const result = getConditionalFormattingFromProperties(visualizationProperties);
            expect(result).toEqual({
                enabled: true,
                rules: [],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            });
        });

        it("returns undefined when there is no persisted config", () => {
            const visualizationProperties: IVisualizationProperties = { controls: {} };
            const result = getConditionalFormattingFromProperties(visualizationProperties);
            expect(result).toBeUndefined();
        });
    });

    describe("isSemanticConditionalFormattingEnabled", () => {
        it("returns true when the semantic flag is on and enableNewPivotTable is omitted (defaults enabled)", () => {
            expect(
                isSemanticConditionalFormattingEnabled({ enableSemanticConditionalFormatting: true }),
            ).toBe(true);
        });

        it("returns false when the semantic flag is off, even with insight-level CF enabled", () => {
            expect(
                isSemanticConditionalFormattingEnabled({
                    enableSemanticConditionalFormatting: false,
                    enableConditionalFormatting: true,
                }),
            ).toBe(false);
        });

        it("returns true when the semantic flag is on, even with insight-level CF disabled", () => {
            expect(
                isSemanticConditionalFormattingEnabled({
                    enableSemanticConditionalFormatting: true,
                    enableConditionalFormatting: false,
                }),
            ).toBe(true);
        });

        it("returns false when enableNewPivotTable is explicitly off, even with the semantic flag on", () => {
            expect(
                isSemanticConditionalFormattingEnabled({
                    enableSemanticConditionalFormatting: true,
                    enableNewPivotTable: false,
                }),
            ).toBe(false);
        });

        it("returns false when settings are undefined", () => {
            expect(isSemanticConditionalFormattingEnabled(undefined)).toBe(false);
        });
    });
});
