// (C) 2019-2024 GoodData Corporation

import { IAutomationAlertRelativeCondition, IAutomationMetadataObject } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import {
    getAlertCompareOperator,
    getAlertMeasure,
    getAlertRelativeOperator,
    getAlertThreshold,
    getValueSuffix,
    isAlertValueDefined,
    isChangeOperator,
    isChangeOrDifferenceOperator,
    isDifferenceOperator,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
} from "../utils.js";
import { AlertMetric, AlertMetricComparatorType } from "../../../types.js";

describe("alert transforms", () => {
    const base: IAutomationMetadataObject = {
        id: "alertId",
        title: "alertTitle",
        description: "alertDescription",
        exportDefinitions: [],
        notificationChannel: "notificationChannelId",
        metadata: {},
        type: "automation",
        production: true,
        deprecated: false,
        unlisted: false,
        ref: {
            uri: "alertUri",
            type: "automation",
            identifier: "alertId",
        },
        uri: "alertUri",
    };

    const baseComparison: IAutomationMetadataObject = {
        ...base,
        alert: {
            condition: {
                type: "comparison",
                left: {
                    id: "",
                },
                right: 0,
                operator: "GREATER_THAN_OR_EQUAL_TO",
            },
            execution: {
                filters: [],
                measures: [],
                attributes: [],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
    };
    const baseRelative: IAutomationMetadataObject = {
        ...base,
        alert: {
            condition: {
                type: "relative",
                operator: "INCREASES_BY",
                measure: {
                    operator: "CHANGE",
                    left: {
                        id: "",
                    },
                    right: {
                        id: "",
                    },
                },
                threshold: 0,
            },
            execution: {
                filters: [],
                measures: [],
                attributes: [],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
    };

    const simpleMetric: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localMetric1",
                title: "metric1",
                definition: {
                    measureDefinition: {
                        filters: [],
                        item: {
                            type: "measure",
                            identifier: "simple_metric_1",
                        },
                    },
                },
            },
        },
        isPrimary: true,
        comparators: [],
    };

    const previousPeriodMetric: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localMetric2",
                title: "metric2",
                format: "#,##0.00",
                definition: {
                    measureDefinition: {
                        filters: [],
                        item: {
                            type: "measure",
                            identifier: "simple_metric_2",
                        },
                    },
                },
            },
        },
        isPrimary: true,
        comparators: [
            {
                comparator: AlertMetricComparatorType.PreviousPeriod,
                isPrimary: false,
                measure: {
                    measure: {
                        localIdentifier: "localMetric_pp_1",
                        title: "metric_pp_1",
                        definition: {
                            previousPeriodMeasure: {
                                measureIdentifier: "localMetric2",
                                dateDataSets: [{ dataSet: { uri: "dateDataSetUri" }, periodsAgo: 1 }],
                            },
                        },
                    },
                },
            },
        ],
    };

    const previousPeriodMetric1: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localMetric2",
                title: "metric2",
                format: "#,##0.00",
                definition: {
                    measureDefinition: {
                        filters: [],
                        item: {
                            type: "measure",
                            identifier: "simple_metric_2",
                        },
                    },
                },
            },
        },
        isPrimary: false,
        comparators: [
            {
                comparator: AlertMetricComparatorType.PreviousPeriod,
                isPrimary: true,
                measure: {
                    measure: {
                        localIdentifier: "localMetric_pp_1",
                        title: "metric_pp_1",
                        definition: {
                            previousPeriodMeasure: {
                                measureIdentifier: "localMetric2",
                                dateDataSets: [{ dataSet: { uri: "dateDataSetUri" }, periodsAgo: 1 }],
                            },
                        },
                    },
                },
            },
        ],
    };

    describe("transformAlertByMetric", () => {
        it("transformAlertByMetric, comparison and provide simple metric", () => {
            const res = transformAlertByMetric(baseComparison, simpleMetric);
            expect(res).toEqual({
                ...baseComparison,
                title: "metric1",
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        left: {
                            format: "#,##0.00",
                            id: "localMetric1",
                            title: "metric1",
                        },
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [simpleMetric.measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, comparison and provide previous period metric", () => {
            const res = transformAlertByMetric(baseComparison, previousPeriodMetric);
            expect(res).toEqual({
                ...baseComparison,
                title: "metric2",
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        left: {
                            format: "#,##0.00",
                            id: "localMetric2",
                            title: "metric2",
                        },
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [previousPeriodMetric.measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, relative and provide simple metric, reset operator dut to condition type change", () => {
            const res = transformAlertByMetric(baseRelative, simpleMetric);
            expect(res).toEqual({
                ...baseComparison,
                title: "metric1",
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        operator: "GREATER_THAN",
                        left: {
                            format: "#,##0.00",
                            id: "localMetric1",
                            title: "metric1",
                        },
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [simpleMetric.measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, relative and provide comparison metric", () => {
            const res = transformAlertByMetric(baseRelative, previousPeriodMetric);
            expect(res).toEqual({
                ...baseRelative,
                title: "metric2",
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        measure: {
                            operator: "CHANGE",
                            left: {
                                format: "#,##0.00",
                                id: "localMetric2",
                                title: "metric2",
                            },
                            right: {
                                format: "#,##0.00",
                                id: "localMetric_pp_1",
                                title: "metric_pp_1",
                            },
                        },
                    },
                    execution: {
                        ...baseRelative.alert.execution,
                        measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, relative and provide comparison metric, relative isPrimary", () => {
            const res = transformAlertByMetric(baseRelative, previousPeriodMetric1);
            expect(res).toEqual({
                ...baseRelative,
                title: "metric2",
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        measure: {
                            operator: "CHANGE",
                            left: {
                                format: "#,##0.00",
                                id: "localMetric2",
                                title: "metric2",
                            },
                            right: {
                                format: "#,##0.00",
                                id: "localMetric_pp_1",
                                title: "metric_pp_1",
                            },
                        },
                    },
                    execution: {
                        ...baseRelative.alert.execution,
                        measures: [previousPeriodMetric.comparators[0].measure, previousPeriodMetric.measure],
                    },
                },
            });
        });
    });

    describe("transformAlertByValue", () => {
        it("transformAlertByValue, comparison value", () => {
            const res = transformAlertByValue(baseComparison, 25);
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        right: 25,
                    },
                },
            });
        });

        it("transformAlertByValue, relative value", () => {
            const res = transformAlertByValue(baseRelative, 25);
            expect(res).toEqual({
                ...baseRelative,
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        threshold: 25,
                    },
                },
            });
        });
    });

    describe("transformAlertByDestination", () => {
        it("transformAlertByDestination, comparison value", () => {
            const res = transformAlertByDestination(baseComparison, "channel_1");
            expect(res).toEqual({
                ...baseComparison,
                notificationChannel: "channel_1",
            });
        });

        it("transformAlertByDestination, relative value", () => {
            const res = transformAlertByDestination(baseRelative, "channel_1");
            expect(res).toEqual({
                ...baseRelative,
                notificationChannel: "channel_1",
            });
        });
    });

    describe("transformAlertByComparisonOperator", () => {
        it("transformAlertByComparisonOperator, comparison value", () => {
            const res = transformAlertByComparisonOperator(baseComparison, simpleMetric, "LESS_THAN");
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        operator: "LESS_THAN",
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [simpleMetric.measure],
                    },
                },
            });
        });

        it("transformAlertByComparisonOperator, relative value", () => {
            const res = transformAlertByComparisonOperator(baseRelative, simpleMetric, "LESS_THAN");
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        operator: "LESS_THAN",
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [simpleMetric.measure],
                    },
                },
            });
        });
    });

    describe("transformAlertByRelativeOperator", () => {
        it("transformAlertByRelativeOperator, comparison value", () => {
            const res = transformAlertByRelativeOperator(
                baseComparison,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const cond = baseRelative.alert.condition as IAutomationAlertRelativeCondition;
            expect(res).toEqual({
                ...baseRelative,
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...cond,
                        operator: "CHANGES_BY",
                        measure: {
                            ...cond.measure,
                            operator: "DIFFERENCE",
                            right: {
                                format: "#,##0.00",
                                id: "localMetric_pp_1",
                                title: "metric_pp_1",
                            },
                        },
                    },
                    execution: {
                        ...baseRelative.alert.execution,
                        measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                    },
                },
            });
        });

        it("transformAlertByRelativeOperator, relative value", () => {
            const res = transformAlertByRelativeOperator(
                baseRelative,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const cond = baseRelative.alert.condition as IAutomationAlertRelativeCondition;
            expect(res).toEqual({
                ...baseRelative,
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...cond,
                        operator: "CHANGES_BY",
                        measure: {
                            ...cond.measure,
                            operator: "DIFFERENCE",
                            right: {
                                format: "#,##0.00",
                                id: "localMetric_pp_1",
                                title: "metric_pp_1",
                            },
                        },
                    },
                    execution: {
                        ...baseRelative.alert.execution,
                        measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                    },
                },
            });
        });
    });

    describe("getter utils", () => {
        it("getAlertThreshold - comparison", () => {
            const threshold = getAlertThreshold(baseComparison.alert);
            expect(threshold).toEqual(0);
        });

        it("getAlertThreshold - relative", () => {
            const threshold = getAlertThreshold(baseRelative.alert);
            expect(threshold).toEqual(0);
        });

        it("getAlertMeasure - comparison", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const data = getAlertMeasure(update.alert);
            expect(data).toEqual("localMetric1");
        });

        it("getAlertMeasure - relative", () => {
            const update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            const data = getAlertMeasure(update.alert);
            expect(data).toEqual("localMetric2");
        });

        it("getAlertCompareOperator - comparison", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const data = getAlertCompareOperator(update.alert);
            expect(data).toEqual("GREATER_THAN_OR_EQUAL_TO");
        });

        it("getAlertCompareOperator - relative", () => {
            const update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            const data = getAlertCompareOperator(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - comparison", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const data = getAlertRelativeOperator(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - relative", () => {
            const update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            const data = getAlertRelativeOperator(update.alert);
            expect(data).toEqual(["INCREASES_BY", "CHANGE"]);
        });

        it("getAlertRelativeOperator - comparison", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const data = getValueSuffix(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - relative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(update, previousPeriodMetric, "CHANGES_BY", "CHANGE");
            const data = getValueSuffix(update.alert);
            expect(data).toEqual("%");
        });

        it("getAlertRelativeOperator - relative, difference", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const data = getValueSuffix(update.alert);
            expect(data).toEqual(undefined);
        });
    });

    describe("is utils", () => {
        it("isChangeOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(update, previousPeriodMetric, "CHANGES_BY", "CHANGE");
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isChangeOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(update, previousPeriodMetric, "CHANGES_BY", "CHANGE");
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isDifferenceOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isChangeOrDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(update, previousPeriodMetric, "CHANGES_BY", "CHANGE");
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOrDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOrDifferenceOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isAlertValueDefined, baseRelative", () => {
            const update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(true);
        });

        it("isAlertValueDefined, baseRelative, undefined", () => {
            let update = transformAlertByMetric(baseRelative, previousPeriodMetric);
            update = transformAlertByValue(update, undefined);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(false);
        });

        it("isAlertValueDefined, baseComparison", () => {
            const update = transformAlertByMetric(baseComparison, simpleMetric);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(true);
        });

        it("isAlertValueDefined, baseComparison, undefined", () => {
            let update = transformAlertByMetric(baseComparison, simpleMetric);
            update = transformAlertByValue(update, undefined);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(false);
        });
    });
});
