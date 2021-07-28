// (C) 2021 GoodData Corporation
import {
    drillToDashboardFromProductAttributeDefinition,
    drillToDashboardFromWonMeasureDefinition,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
} from "../../../model/tests/Dashboard.fixtures";
import { DrillOrigin } from "@gooddata/sdk-backend-spi";
import { validateDrillDefinitionOrigin } from "../InsightDrillDefinitionUtils";
import { uriRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import cloneDeep from "lodash/cloneDeep";

describe("InsightDrillDefinitionUtils", () => {
    describe("validateDrillDefinitionOrigin", () => {
        const drillTargets: IAvailableDrillTargets = SimpleDashboardSimpleSortedTableWidgetDrillTargets;

        it("should not throw error for valid measure origin drill definition ", async () => {
            const result = validateDrillDefinitionOrigin(
                drillToDashboardFromWonMeasureDefinition,
                drillTargets,
            );
            expect(result).toEqual(drillToDashboardFromWonMeasureDefinition);
        });

        it("should not throw error for valid attribute origin drill definition ", async () => {
            const result = validateDrillDefinitionOrigin(
                drillToDashboardFromProductAttributeDefinition,
                drillTargets,
            );
            expect(result).toEqual(drillToDashboardFromProductAttributeDefinition);
        });

        it("should throw error for invalid measure unknown origin localIdentifier ", async () => {
            const invalidMeasureOriginDrill = cloneDeep(drillToDashboardFromProductAttributeDefinition);
            const invalidMeasureOrigin: DrillOrigin = {
                type: "drillFromMeasure",
                measure: {
                    localIdentifier: "some origin",
                },
            };
            invalidMeasureOriginDrill.origin = invalidMeasureOrigin;

            expect(() => {
                validateDrillDefinitionOrigin(invalidMeasureOriginDrill, drillTargets);
            }).toThrowErrorMatchingSnapshot();
        });

        it("should throw error for invalid attribute unknown origin localIdentifier ", async () => {
            const invalidAttributeOriginDrill = cloneDeep(drillToDashboardFromProductAttributeDefinition);
            const invalidAttributeOrigin: DrillOrigin = {
                type: "drillFromAttribute",
                attribute: {
                    localIdentifier: "some origin",
                },
            };

            invalidAttributeOriginDrill.origin = invalidAttributeOrigin;

            expect(() => {
                validateDrillDefinitionOrigin(invalidAttributeOriginDrill, drillTargets);
            }).toThrowErrorMatchingSnapshot();
        });

        it("should throw error for invalid attribute ref", async () => {
            const uriRefAttributeOriginDrill = cloneDeep(drillToDashboardFromProductAttributeDefinition);
            const uriRefAttributeOrigin: DrillOrigin = {
                type: "drillFromAttribute",
                attribute: uriRef("some ref"),
            };

            uriRefAttributeOriginDrill.origin = uriRefAttributeOrigin;

            expect(() => {
                validateDrillDefinitionOrigin(uriRefAttributeOriginDrill, drillTargets);
            }).toThrowErrorMatchingSnapshot();
        });
    });
});
