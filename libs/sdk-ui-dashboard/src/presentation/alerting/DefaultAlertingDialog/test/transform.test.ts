// (C) 2019-2025 GoodData Corporation

import { createIntlMock } from "@gooddata/sdk-ui";
import {
    IAutomationAlertRelativeCondition,
    IAutomationMetadataObject,
    IDataSetMetadataObject,
} from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import {
    transformAlertByAttribute,
    transformAlertByComparisonOperator,
    transformAlertByDestination,
    transformAlertByMetric,
    transformAlertByRelativeOperator,
    transformAlertByValue,
    transformAlertExecutionByMetric,
} from "../utils/transformation.js";
import {
    getAlertAttribute,
    getAlertCompareOperator,
    getAlertComparison,
    getAlertFilters,
    getAlertMeasure,
    getAlertRelativeOperator,
    getAlertThreshold,
    getDescription,
    getSubtitle,
    getValueSuffix,
} from "../utils/getters.js";
import {
    isAlertValueDefined,
    isChangeOperator,
    isChangeOrDifferenceOperator,
    isDifferenceOperator,
} from "../utils/guards.js";
import {
    AlertAttribute,
    AlertMetric,
    AlertMetricComparator,
    AlertMetricComparatorType,
} from "../../types.js";

describe("alert transforms", () => {
    const mockIntl = createIntlMock();

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
                auxMeasures: [],
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
                auxMeasures: [],
                attributes: [],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
    };
    const baseRelativeWithFilter: IAutomationMetadataObject = {
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
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "date",
                                type: "dataSet",
                            },
                            from: 0,
                            granularity: "GDC.time.quarter",
                            localIdentifier: "relativeDateFilter_date_GDC.time.quarter",
                            to: 0,
                        },
                    },
                ],
                measures: [],
                auxMeasures: [],
                attributes: [],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
        metadata: {
            filters: ["relativeDateFilter_date_GDC.time.quarter"],
        },
    };
    const baseRelativeWithUserFilter: IAutomationMetadataObject = {
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
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "date",
                                type: "dataSet",
                            },
                            from: -2,
                            granularity: "GDC.time.year",
                            to: 2,
                        },
                    },
                ],
                measures: [],
                auxMeasures: [],
                attributes: [],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
        metadata: {
            filters: ["relativeDateFilter_date_GDC.time.quarter"],
        },
    };

    const baseAllAttribute: IAutomationMetadataObject = {
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
                filters: [
                    {
                        negativeAttributeFilter: {
                            displayForm: {
                                localIdentifier: "attr-region",
                            },
                            notIn: {
                                values: [],
                            },
                        },
                    },
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                type: "dataSet",
                                identifier: "dateDataSet",
                            },
                            from: "2019-01-01",
                            to: "2019-12-31",
                        },
                    },
                ],
                measures: [],
                auxMeasures: [],
                attributes: [
                    {
                        attribute: {
                            localIdentifier: "attr-region",
                            displayForm: {
                                type: "displayForm",
                                identifier: "region",
                            },
                        },
                    },
                ],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
    };
    const baseValueAttribute: IAutomationMetadataObject = {
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
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                localIdentifier: "attr-type",
                            },
                            in: {
                                values: ["Social"],
                            },
                        },
                    },
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                type: "dataSet",
                                identifier: "dateDataSet",
                            },
                            from: "2019-01-01",
                            to: "2019-12-31",
                        },
                    },
                ],
                measures: [],
                auxMeasures: [],
                attributes: [
                    {
                        attribute: {
                            localIdentifier: "attr-type",
                            displayForm: {
                                type: "displayForm",
                                identifier: "type",
                            },
                        },
                    },
                ],
            },
            trigger: {
                state: "ACTIVE",
                mode: "ALWAYS",
            },
        },
    };

    const simpleMetric1: AlertMetric = {
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
    const simpleMetric2: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localMetric2",
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
    const arithmeticMetric1: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localArtMetric1",
                title: "metricArt",
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["localMetric1", "localMetric2"],
                        operator: "sum",
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
                localIdentifier: "localPPMetric1",
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
                localIdentifier: "localPPMetric2",
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
    const previousPeriodMetric2: AlertMetric = {
        measure: {
            measure: {
                localIdentifier: "localPPMetric2",
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

    const allMetrics = [
        simpleMetric1,
        previousPeriodMetric,
        previousPeriodMetric1,
        simpleMetric2,
        arithmeticMetric1,
    ];

    const attrRegion: AlertAttribute = {
        attribute: {
            attribute: {
                localIdentifier: "attr-region",
                displayForm: {
                    type: "displayForm",
                    identifier: "region",
                },
                showAllValues: false,
            },
        },
        type: "attribute",
    };

    const attrType: AlertAttribute = {
        attribute: {
            attribute: {
                localIdentifier: "attr-type",
                displayForm: {
                    type: "displayForm",
                    identifier: "type",
                },
            },
        },
        type: "attribute",
    };

    const allAttributes = [attrRegion, attrType];

    describe("transformAlertByMetric", () => {
        it("transformAlertByMetric, comparison and provide simple metric", () => {
            const res = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            expect(res).toEqual({
                ...baseComparison,
                title: "alertTitle",
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
                        measures: [simpleMetric1.measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, comparison and provide previous period metric", () => {
            const res = transformAlertByMetric(allMetrics, baseComparison, previousPeriodMetric);
            expect(res).toEqual({
                ...baseComparison,
                title: "alertTitle",
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        left: {
                            format: "#,##0.00",
                            id: "localPPMetric1",
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
            const res = transformAlertByMetric(allMetrics, baseRelative, simpleMetric1);
            expect(res).toEqual({
                ...baseComparison,
                title: "alertTitle",
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
                        measures: [simpleMetric1.measure],
                    },
                },
            });
        });

        it("transformAlertByMetric, relative and provide comparison metric, relative isSecondary", () => {
            const res = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            expect(res).toEqual({
                ...baseRelative,
                title: "alertTitle",
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        measure: {
                            operator: "CHANGE",
                            left: {
                                format: "#,##0.00",
                                id: "localPPMetric1",
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
            const res = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric1);
            expect(res).toEqual({
                ...baseRelative,
                title: "alertTitle",
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        measure: {
                            operator: "CHANGE",
                            left: {
                                format: "#,##0.00",
                                id: "localMetric_pp_1",
                                title: "metric_pp_1",
                            },
                            right: {
                                format: "#,##0.00",
                                id: "localPPMetric2",
                                title: "metric2",
                            },
                        },
                    },
                    execution: {
                        ...baseRelative.alert.execution,
                        measures: [
                            previousPeriodMetric1.measure,
                            previousPeriodMetric1.comparators[0].measure,
                        ],
                    },
                },
            });
        });

        it("transformAlertByMetric, relative and provide comparison metric, normal and relative are isPrimary", () => {
            const res = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric2);
            expect(res).toEqual({
                ...baseRelative,
                title: "alertTitle",
                alert: {
                    ...baseRelative.alert,
                    condition: {
                        ...baseRelative.alert.condition,
                        measure: {
                            operator: "CHANGE",
                            left: {
                                format: "#,##0.00",
                                id: "localPPMetric2",
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
                        measures: [
                            previousPeriodMetric2.measure,
                            previousPeriodMetric2.comparators[0].measure,
                        ],
                    },
                },
            });
        });

        it("transformAlertByMetric, comparison with arithmetic metric", () => {
            const res = transformAlertByMetric(allMetrics, baseComparison, arithmeticMetric1);
            expect(res).toEqual({
                ...baseComparison,
                title: "alertTitle",
                alert: {
                    ...baseComparison.alert,
                    condition: {
                        ...baseComparison.alert.condition,
                        left: {
                            format: "#,##0.00",
                            id: "localArtMetric1",
                            title: "metricArt",
                        },
                    },
                    execution: {
                        ...baseComparison.alert.execution,
                        measures: [arithmeticMetric1.measure],
                        auxMeasures: [simpleMetric1.measure, simpleMetric2.measure],
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
            const res = transformAlertByComparisonOperator(
                allMetrics,
                baseComparison,
                simpleMetric1,
                "LESS_THAN",
            );
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
                        measures: [simpleMetric1.measure],
                    },
                },
            });
        });

        it("transformAlertByComparisonOperator, relative value", () => {
            const res = transformAlertByComparisonOperator(
                allMetrics,
                baseRelative,
                simpleMetric1,
                "LESS_THAN",
            );
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
                        measures: [simpleMetric1.measure],
                    },
                },
            });
        });
    });

    describe("transformAlertByRelativeOperator", () => {
        it("transformAlertByRelativeOperator, comparison value", () => {
            const res = transformAlertByRelativeOperator(
                allMetrics,
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
                            left: {
                                format: "#,##0.00",
                                id: "localPPMetric1",
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

        it("transformAlertByRelativeOperator, relative value", () => {
            const res = transformAlertByRelativeOperator(
                allMetrics,
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
                            left: {
                                format: "#,##0.00",
                                id: "localPPMetric1",
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
    });

    describe("transformAlertByAttribute", () => {
        it("empty attribute", () => {
            const res = transformAlertByAttribute(allAttributes, baseComparison, undefined, undefined);
            expect(res).toEqual(baseComparison);
        });

        it("attribute with all values", () => {
            const res = transformAlertByAttribute(allAttributes, baseComparison, attrRegion, undefined);
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    execution: {
                        ...baseComparison.alert.execution,
                        attributes: [attrRegion.attribute],
                        filters: [
                            {
                                negativeAttributeFilter: {
                                    displayForm: {
                                        localIdentifier: "attr-region",
                                    },
                                    notIn: {
                                        values: [],
                                    },
                                },
                            },
                        ],
                    },
                },
            });
        });

        it("attribute with defined value", () => {
            const res = transformAlertByAttribute(allAttributes, baseComparison, attrRegion, {
                name: "America",
                value: "America",
                title: "America",
            });
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    execution: {
                        ...baseComparison.alert.execution,
                        attributes: [attrRegion.attribute],
                        filters: [
                            {
                                positiveAttributeFilter: {
                                    displayForm: {
                                        localIdentifier: "attr-region",
                                    },
                                    in: {
                                        values: ["America"],
                                    },
                                },
                            },
                        ],
                    },
                },
            });
        });

        it("attribute with defined value, switch to empty", () => {
            let res = transformAlertByAttribute(allAttributes, baseComparison, attrRegion, {
                name: "America",
                value: "America",
                title: "America",
            });
            expect(res).toEqual({
                ...baseComparison,
                alert: {
                    ...baseComparison.alert,
                    execution: {
                        ...baseComparison.alert.execution,
                        attributes: [attrRegion.attribute],
                        filters: [
                            {
                                positiveAttributeFilter: {
                                    displayForm: {
                                        localIdentifier: "attr-region",
                                    },
                                    in: {
                                        values: ["America"],
                                    },
                                    localIdentifier: undefined,
                                },
                            },
                        ],
                    },
                },
            });

            res = transformAlertByAttribute(allAttributes, res, undefined, undefined);
            expect(res).toEqual(baseComparison);
        });
    });

    describe("transformAlertExecutionByMetric", () => {
        const dataset: IDataSetMetadataObject = {
            ref: {
                identifier: "date",
                type: "dataSet",
            },
            title: "Date",
            description: "",
            tags: [],
            id: "date",
            type: "dataSet",
            unlisted: false,
            deprecated: false,
            production: false,
            uri: "date",
        };

        it("no dataset and granularity provided", () => {
            const comp = previousPeriodMetric.comparators[0];
            const cond = baseRelative.alert.condition;
            const { execution, metadata } = transformAlertExecutionByMetric(
                allMetrics,
                baseRelative,
                cond,
                previousPeriodMetric,
                comp,
            );

            expect(execution).toEqual({
                filters: [],
                measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                auxMeasures: [],
                attributes: [],
            });
            expect(metadata.filters).toEqual(undefined);
        });

        it("dataset and granularity provided", () => {
            const comp1: AlertMetricComparator = {
                ...previousPeriodMetric.comparators[0],
                dataset,
                granularity: "GDC.time.quarter",
            };
            const cond = baseRelative.alert.condition;

            const res1 = transformAlertExecutionByMetric(
                allMetrics,
                baseRelative,
                cond,
                previousPeriodMetric,
                comp1,
            );

            expect(res1.execution).toEqual({
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "date",
                                type: "dataSet",
                            },
                            from: 0,
                            granularity: "GDC.time.quarter",
                            localIdentifier: "relativeDateFilter_date_GDC.time.quarter",
                            to: 0,
                        },
                    },
                ],
                measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                auxMeasures: [],
                attributes: [],
            });
            expect(res1.metadata.filters).toEqual(["relativeDateFilter_date_GDC.time.quarter"]);
        });

        it("dataset and granularity provided with replacing old filter", () => {
            const comp1: AlertMetricComparator = {
                ...previousPeriodMetric.comparators[0],
                dataset,
                granularity: "GDC.time.quarter",
            };
            const cond = baseRelativeWithFilter.alert.condition;

            const res1 = transformAlertExecutionByMetric(
                allMetrics,
                baseRelativeWithFilter,
                cond,
                previousPeriodMetric,
                comp1,
            );

            expect(res1.execution).toEqual({
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "date",
                                type: "dataSet",
                            },
                            from: 0,
                            granularity: "GDC.time.quarter",
                            localIdentifier: "relativeDateFilter_date_GDC.time.quarter",
                            to: 0,
                        },
                    },
                ],
                measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                auxMeasures: [],
                attributes: [],
            });
            expect(res1.metadata.filters).toEqual(["relativeDateFilter_date_GDC.time.quarter"]);
        });

        it("dataset and granularity provided with existing filter, add on start", () => {
            const comp1: AlertMetricComparator = {
                ...previousPeriodMetric.comparators[0],
                dataset,
                granularity: "GDC.time.quarter",
            };
            const cond = baseRelativeWithUserFilter.alert.condition;

            const res1 = transformAlertExecutionByMetric(
                allMetrics,
                baseRelativeWithUserFilter,
                cond,
                previousPeriodMetric,
                comp1,
            );

            expect(res1.execution).toEqual({
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "date",
                                type: "dataSet",
                            },
                            from: 0,
                            granularity: "GDC.time.quarter",
                            localIdentifier: "relativeDateFilter_date_GDC.time.quarter",
                            to: 0,
                        },
                    },
                    ...baseRelativeWithUserFilter.alert.execution.filters,
                ],
                measures: [previousPeriodMetric.measure, previousPeriodMetric.comparators[0].measure],
                auxMeasures: [],
                attributes: [],
            });
            expect(res1.metadata.filters).toEqual(["relativeDateFilter_date_GDC.time.quarter"]);
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
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const data = getAlertMeasure([simpleMetric1], update.alert);
            expect(data.measure.measure.localIdentifier).toEqual("localMetric1");
        });

        it("getAlertMeasure - relative, primary", () => {
            const update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            const data = getAlertMeasure([previousPeriodMetric], update.alert);
            expect(data.measure.measure.localIdentifier).toEqual("localPPMetric1");
        });

        it("getAlertMeasure - relative, not primary", () => {
            const update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric1);
            const data = getAlertMeasure([previousPeriodMetric1], update.alert);
            expect(data.measure.measure.localIdentifier).toEqual("localPPMetric2");
        });

        it("getAlertCompareOperator - comparison", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const data = getAlertCompareOperator(update.alert);
            expect(data).toEqual("GREATER_THAN_OR_EQUAL_TO");
        });

        it("getAlertCompareOperator - relative", () => {
            const update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            const data = getAlertCompareOperator(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - comparison", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const data = getAlertRelativeOperator(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - relative", () => {
            const update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            const data = getAlertRelativeOperator(update.alert);
            expect(data).toEqual(["INCREASES_BY", "CHANGE"]);
        });

        it("getAlertRelativeOperator - comparison", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const data = getValueSuffix(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertRelativeOperator - relative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "CHANGE",
            );
            const data = getValueSuffix(update.alert);
            expect(data).toEqual("%");
        });

        it("getAlertRelativeOperator - relative, difference", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const data = getValueSuffix(update.alert);
            expect(data).toEqual(undefined);
        });

        it("getAlertAttribute - no attribute", () => {
            const [attr, value] = getAlertAttribute(allAttributes, baseComparison);
            expect(attr).toEqual(undefined);
            expect(value).toEqual(undefined);
        });

        it("getAlertAttribute - region attribute", () => {
            const [attr, value] = getAlertAttribute(allAttributes, baseAllAttribute);
            expect(attr).toEqual(attrRegion);
            expect(value).toEqual(undefined);
        });

        it("getAlertAttribute - type attribute", () => {
            const [attr, value] = getAlertAttribute(allAttributes, baseValueAttribute);
            expect(attr).toEqual(attrType);
            expect(value).toEqual("Social");
        });

        it("getAlertFilters - no filters", () => {
            const filters = getAlertFilters(baseComparison);
            expect(filters.length).toEqual(0);
        });

        it("getAlertFilters - one filter, other ignored", () => {
            const filters = getAlertFilters(baseAllAttribute);
            expect(filters.length).toEqual(1);
            expect(filters[0]).toEqual(baseAllAttribute.alert?.execution.filters[1]);
        });

        it("getAlertComparison - previous period metric", () => {
            const res = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            const comp = getAlertComparison(previousPeriodMetric, res.alert);
            expect(comp).toEqual(previousPeriodMetric.comparators[0]);
        });

        it("getAlertComparison - simple metric", () => {
            const res = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const comp = getAlertComparison(simpleMetric1, res.alert);
            expect(comp).toEqual(undefined);
        });

        it("getDescription - basic", () => {
            const res = getDescription(mockIntl, [], baseComparison, {
                decimal: ",",
                thousand: ".",
            });
            expect(res).toBe("Is greater than or equal to 0,00");
        });

        it("getDescription - relative", () => {
            const res = getDescription(mockIntl, [], baseRelative, {
                decimal: ",",
                thousand: ".",
            });
            expect(res).toBe("Increases by 0,00%");
        });

        it("getDescription - relative with filter", () => {
            const res = getDescription(mockIntl, [], baseRelativeWithFilter, {
                decimal: ",",
                thousand: ".",
            });
            expect(res).toBe("Increases by 0,00%");
        });

        it("getSubtitle - basic", () => {
            const res = getSubtitle(mockIntl, "Name", baseComparison, {
                decimal: ",",
                thousand: ".",
            });
            expect(res).toBe("Is greater than or equal to 0,00 • Name");
        });

        it("getSubtitle - relative with filter", () => {
            const res = getSubtitle(mockIntl, "Name", baseRelativeWithFilter, {
                decimal: ",",
                thousand: ".",
            });
            expect(res).toBe("Increases by 0,00% • Name");
        });
    });

    describe("is utils", () => {
        it("isChangeOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "CHANGE",
            );
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isChangeOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const res = isChangeOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "CHANGE",
            );
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isDifferenceOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const res = isDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isChangeOrDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "CHANGE",
            );
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOrDifferenceOperator, baseRelative, change", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByRelativeOperator(
                allMetrics,
                update,
                previousPeriodMetric,
                "CHANGES_BY",
                "DIFFERENCE",
            );
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(true);
        });

        it("isChangeOrDifferenceOperator, baseComparison, change", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const res = isChangeOrDifferenceOperator(update.alert);
            expect(res).toEqual(false);
        });

        it("isAlertValueDefined, baseRelative", () => {
            const update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(true);
        });

        it("isAlertValueDefined, baseRelative, undefined", () => {
            let update = transformAlertByMetric(allMetrics, baseRelative, previousPeriodMetric);
            update = transformAlertByValue(update, undefined);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(false);
        });

        it("isAlertValueDefined, baseComparison", () => {
            const update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(true);
        });

        it("isAlertValueDefined, baseComparison, undefined", () => {
            let update = transformAlertByMetric(allMetrics, baseComparison, simpleMetric1);
            update = transformAlertByValue(update, undefined);
            const res = isAlertValueDefined(update.alert);
            expect(res).toEqual(false);
        });
    });
});
