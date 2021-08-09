// (C) 2021 GoodData Corporation
import {
    ComplexDashboardWithReferences,
    dashboardsList,
    drillToDashboardFromProductAttributeDefinition,
    drillToDashboardFromWonMeasureDefinition,
    drillToToInsightFromWonMeasureDefinition,
    SimpleSortedTableWidgetInsight,
    SimpleDashboardSimpleSortedTableWidgetDrillTargets,
} from "../../../model/tests/Dashboard.fixtures";
import { DrillOrigin } from "@gooddata/sdk-backend-spi";
import {
    InsightDrillDefinitionValidationData,
    validateDrillDefinitionOrigin,
    validateInsightDrillDefinition,
} from "../InsightDrillDefinitionUtils";
import { idRef, uriRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import cloneDeep from "lodash/cloneDeep";
import { newInsightMap, newMapForObjectWithIdentity } from "../../metadata/objRefMap";

describe("validateDrillDefinitionOrigin", () => {
    const drillTargets: IAvailableDrillTargets = SimpleDashboardSimpleSortedTableWidgetDrillTargets;

    it("should not throw error for valid measure origin drill definition ", async () => {
        const result = validateDrillDefinitionOrigin(drillToDashboardFromWonMeasureDefinition, drillTargets);
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

describe("validateInsightDrillDefinition", () => {
    const validationContext: InsightDrillDefinitionValidationData = {
        dashboardsMap: newMapForObjectWithIdentity(dashboardsList),
        insightsMap: newInsightMap([SimpleSortedTableWidgetInsight]),
    };

    describe("validate IDrillToDashboard definition", () => {
        it("should not throw error for valid definition with target identifier", async () => {
            const result = validateInsightDrillDefinition(
                drillToDashboardFromWonMeasureDefinition,
                validationContext,
            );
            expect(result).toEqual(drillToDashboardFromWonMeasureDefinition);
        });

        it("should not throw error for valid definition with target uri", async () => {
            const uriTarget = cloneDeep(drillToDashboardFromWonMeasureDefinition);
            uriTarget.target = uriRef(ComplexDashboardWithReferences.dashboard.uri);

            const result = validateInsightDrillDefinition(uriTarget, validationContext);
            expect(result).toEqual(drillToDashboardFromWonMeasureDefinition);
        });

        it("should not throw error for valid definition with target undefined", async () => {
            const undefinedTarget = cloneDeep(drillToDashboardFromWonMeasureDefinition);
            undefinedTarget.target = undefined;

            const result = validateInsightDrillDefinition(undefinedTarget, validationContext);
            expect(result).toEqual(undefinedTarget);
        });

        it("should throw error for unknown UriRef target IDrillToDashboard definition", async () => {
            const invalidTarget = cloneDeep(drillToDashboardFromWonMeasureDefinition);
            invalidTarget.target = uriRef("some ref");
            expect(() => {
                validateInsightDrillDefinition(invalidTarget, validationContext);
            }).toThrowErrorMatchingSnapshot();
        });

        it("should throw error for unknown idRef target IDrillToDashboard definition", async () => {
            const invalidTarget = cloneDeep(drillToDashboardFromWonMeasureDefinition);
            invalidTarget.target = idRef("some id");
            expect(() => {
                validateInsightDrillDefinition(invalidTarget, validationContext);
            }).toThrowErrorMatchingSnapshot();
        });
    });

    describe("validate IDrillToInsight definition", () => {
        it("should not throw error for valid definition with target uri", async () => {
            const result = validateInsightDrillDefinition(
                drillToToInsightFromWonMeasureDefinition,
                validationContext,
            );
            expect(result).toEqual(drillToToInsightFromWonMeasureDefinition);
        });

        it("should not throw error for valid definition with target identifier", async () => {
            const identifierTarget = cloneDeep(drillToToInsightFromWonMeasureDefinition);
            identifierTarget.target = idRef(SimpleSortedTableWidgetInsight.insight.identifier);

            const result = validateInsightDrillDefinition(identifierTarget, validationContext);
            expect(result).toEqual(drillToToInsightFromWonMeasureDefinition);
        });

        it("should throw error for unknown UriRef target IDrillToDashboard definition", async () => {
            const invalidUriTarget = cloneDeep(drillToToInsightFromWonMeasureDefinition);
            invalidUriTarget.target = uriRef("some ref");
            expect(() => {
                validateInsightDrillDefinition(invalidUriTarget, validationContext);
            }).toThrowErrorMatchingSnapshot();
        });

        it("should throw error for unknown idRef target IDrillToDashboard definition", async () => {
            const invalidIdTarget = cloneDeep(drillToToInsightFromWonMeasureDefinition);
            invalidIdTarget.target = idRef("some id");
            expect(() => {
                validateInsightDrillDefinition(invalidIdTarget, validationContext);
            }).toThrowErrorMatchingSnapshot();
        });
    });
});
