// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
import { beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { ErrorCodes } from "@gooddata/sdk-ui";
import { Axis, PluggableVisualizationErrorCodes } from "@gooddata/sdk-ui-ext/internal";

import { MEASURES, METRIC, STACK, VIEW } from "../constants/bucket.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { metricAttributeFilter } from "../models/decorated_metric_attribute_filter.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { addFiltersToState } from "../store/filter_bar/filter_bar_actions.js";
import { type IAppState } from "../store/types.js";
import {
    activityDateDataset,
    closedDateDataset,
    seedDateDatasetsMeta,
} from "../tests/constants.test.helpers.js";
import {
    withOpenAsReportUiConfig,
    withUiConfig,
} from "../tests/extended_reference_point_builder.test.helpers.js";
import {
    comparisonMeasureValueFilter,
    rankingFilterWithoutAttributes,
} from "../tests/filter.test.helpers.js";
import { seedMeasureDateDatasetStatus } from "../tests/measure_date_datasets.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { createFakeTestIntl } from "../utils/translations.js";

import { exportButtonSelector } from "./export_button_selector.js";
import { bucketsAddItem } from "./test_helpers.js";

describe("exportButtonSelector", () => {
    let state: IAppState;
    const fakeIntl: IntlShape = createFakeTestIntl();

    beforeEach(() => {
        const stateWithDateDatasetMeta = seedDateDatasetsMeta(getInitializedState(), {
            items: [
                {
                    identifier: "closed.dataset.dt",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/15174",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/15174"),
                    type: "dateDataset",
                    title: "Date (closed)",
                    summary: "DataSet Date",
                    attributes: [],
                },
            ],
        });

        const availableMeasureDatasets = [activityDateDataset, closedDateDataset];
        const stateWithMeasureDateDatasets = seedMeasureDateDatasetStatus(
            stateWithDateDatasetMeta,
            "m1",
            availableMeasureDatasets,
            0,
        );

        state = withData(
            withData(stateWithMeasureDateDatasets, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [],
                    },
                    {
                        localIdentifier: STACK,
                        items: [],
                    },
                ],
            }),
            {
                extendedReferencePoint: withOpenAsReportUiConfig(
                    stateWithMeasureDateDatasets.data.extendedReferencePoint,
                    { supported: true },
                ),
            },
        );
    });

    const createFilter = (props = {}) => metricAttributeFilter(props);

    function addSingleAttributeMetric() {
        state = bucketsAddItem(state, MEASURES, {
            attribute: "sample.attribute.bar",
            filters: [
                createFilter({
                    attribute: "some.attribute",
                }),
            ],
        });
    }

    function makeValidInsightForOaR() {
        addSingleAttributeMetric();
    }

    describe("empty visualization", () => {
        it("should set isExportDisabled without specific bubble message", () => {
            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
            expect(bubbleTextProvider).not.toBeDefined();
        });
    });

    describe("valid visualization", () => {
        it("should not set isExportDisabled for valid buckets and visualization supporting OaR", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });
            state = bucketsAddItem(state, STACK, {
                attribute: "sample.attribute.bar",
                type: "attribute",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(false);
        });
    });

    describe("duplicatedObject", () => {
        it("should set isExportDisabled when metric bucket contains the same item", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toBe(true);
        });

        it("should not be set when metric bucket contains the same item with different aggregation", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                aggregation: "count",
                type: "metric",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                aggregation: "sum",
                type: "metric",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toBe(false);
        });

        it("should set isExportDisabled when metric bucket contains the same item with same aggregation", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                aggregation: "sum",
                type: "metric",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                aggregation: "sum",
                type: "metric",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toBe(true);
        });

        it("should set isExportDisabled when categories and stacks contain the same item", () => {
            state = bucketsAddItem(state, VIEW, {
                attribute: "sample.attribute.foo",
                type: "attribute",
            });
            state = bucketsAddItem(state, STACK, {
                attribute: "sample.attribute.foo",
                type: "attribute",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toBe(true);
        });

        it("should provide bubble text containing title and type", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });

            const { bubbleTextProvider } = exportButtonSelector(state);

            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual(
                "(translated export_unsupported.duplicated_metric with values { " +
                    "title:sample.attribute.foo, type:(translated bucket_item_types.attribute) })",
            );
        });
    });

    describe("metric date filter used", () => {
        it("should not set isExportDisabled when no metric contains date filter", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
                filters: [
                    createFilter({
                        attribute: "non-date-dataset-attribute-string",
                    }),
                ],
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(false);
        });

        it("should set isExportDisabled and provide bubble text when one or more metrics contain date filter", () => {
            state = bucketsAddItem(state, MEASURES, {
                localIdentifier: "m1",
                attribute: "sample.attribute.foo",
                type: "metric",
                filters: [
                    createFilter({
                        attribute: DATE_DATASET_ATTRIBUTE, // 'attr.datedataset'
                    }),
                ],
            });

            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.metric_date_filter)");
        });
    });

    describe("renaming", () => {
        it("should set isExportDisabled when measure bucket item is renamed", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                alias: "asdf",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
        });

        it("should set isExportDisabled when category bucket item is renamed", () => {
            state = bucketsAddItem(state, VIEW, {
                attribute: "sample.attribute.foo",
                alias: "asdf",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
        });

        it("should set isExportDisabled when stack bucket item is renamed", () => {
            state = bucketsAddItem(state, STACK, {
                attribute: "sample.attribute.foo",
                alias: "asdf",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
        });

        it("should provide specific bubble message", () => {
            state = bucketsAddItem(state, STACK, {
                attribute: "sample.attribute.foo",
                alias: "asdf",
            });

            const { bubbleTextProvider } = exportButtonSelector(state);

            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.renaming)");
        });
    });

    describe("execution states", () => {
        describe("execution errors", () => {
            it("should set isExportDisabled for all listed execution statues", () => {
                makeValidInsightForOaR();

                const statuses = [
                    ErrorCodes.PROTECTED_REPORT,
                    ErrorCodes.NEGATIVE_VALUES,
                    ErrorCodes.BAD_REQUEST,
                    ErrorCodes.NO_DATA,
                    PluggableVisualizationErrorCodes.INVALID_BUCKETS,
                    ErrorCodes.DATA_TOO_LARGE_TO_DISPLAY,
                    ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
                ];

                statuses.forEach((status) => {
                    const updatedState = withReport(state, {
                        execution: withExecutionError(state.report.execution, { status: status }),
                    });

                    const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(updatedState);

                    expect(isExportDisabled).toEqual(true);
                    expect(bubbleTextProvider).not.toBeDefined();
                });
            });
        });

        describe("execution running", () => {
            it("should set isExportDisabled without specific bubble message", () => {
                makeValidInsightForOaR();
                const updatedState = withReport(state, {
                    execution: { ...state.report.execution, running: true },
                });

                const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(updatedState);

                expect(isExportDisabled).toEqual(true);
                expect(bubbleTextProvider).not.toBeDefined();
            });
        });
    });

    describe("openAsReportUiConfig", () => {
        it("should set isExportDisabled and use provided message if OaR not supported in UI config", () => {
            const updatedState = withData(
                withData(state, {
                    extendedReferencePoint: withOpenAsReportUiConfig(state.data.extendedReferencePoint, {
                        supported: false,
                    }),
                }),
                {
                    extendedReferencePoint: withOpenAsReportUiConfig(
                        withData(state, {
                            extendedReferencePoint: withOpenAsReportUiConfig(
                                state.data.extendedReferencePoint,
                                { supported: false },
                            ),
                        }).data.extendedReferencePoint,
                        { warningMessage: "custom message" },
                    ),
                },
            );

            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(updatedState);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("custom message");
        });

        it("should set isExportDisabled and use default message if OaR not supported in UI config", () => {
            const updatedState = withData(state, {
                extendedReferencePoint: withOpenAsReportUiConfig(state.data.extendedReferencePoint, {
                    supported: false,
                }),
            });

            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(updatedState);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.unsupportedInsightType)");
        });
    });

    describe("derived measures", () => {
        it("should set isExportDisabled to false when there is no derived measure in buckets", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                type: METRIC,
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(false);
        });

        it("should set isExportDisabled to true when there is a derived measure in the buckets", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                type: METRIC,
                localIdentifier: "m1",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                type: METRIC,
                masterLocalIdentifier: "m1",
            });

            const { isExportDisabled } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
        });
    });

    describe("measure shows on secondary axis", () => {
        const { AXIS } = Axis;

        beforeEach(() => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.foo",
                type: "metric",
            });
        });

        it("should set isExportDisabled to false when there is NO measure shown on secondary axis", () => {
            let { isExportDisabled } = exportButtonSelector(state);
            expect(isExportDisabled).toEqual(false);

            const updatedState = withData(state, {
                extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, {
                    axis: AXIS.PRIMARY,
                }),
            });
            isExportDisabled = exportButtonSelector(updatedState).isExportDisabled;
            expect(isExportDisabled).toEqual(false);
        });

        it("should set isExportDisabled to true when there is a measure shown on secondary axis", () => {
            let updatedState = withData(state, {
                extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, {
                    axis: AXIS.SECONDARY,
                }),
            });

            let { isExportDisabled } = exportButtonSelector(updatedState);
            expect(isExportDisabled).toEqual(true);

            updatedState = withData(state, {
                extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, { axis: AXIS.DUAL }),
            });
            isExportDisabled = exportButtonSelector(updatedState).isExportDisabled;
            expect(isExportDisabled).toEqual(true);
        });

        it("should provide bubble message when secondary axis is available", () => {
            let updatedState = withData(state, {
                extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, {
                    axis: AXIS.SECONDARY,
                }),
            });

            let { bubbleTextProvider } = exportButtonSelector(updatedState);
            expect(bubbleTextProvider(fakeIntl)).toEqual("(translated export_unsupported.dual_axes)");

            updatedState = withData(state, {
                extendedReferencePoint: withUiConfig(state.data.extendedReferencePoint, { axis: AXIS.DUAL }),
            });
            bubbleTextProvider = exportButtonSelector(updatedState).bubbleTextProvider;
            expect(bubbleTextProvider(fakeIntl)).toEqual("(translated export_unsupported.dual_axes)");
        });
    });

    describe("arithmetic measures", () => {
        it("should disable export with text message when there is arithmetic measure in buckets", () => {
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                type: METRIC,
                localIdentifier: "m1",
            });
            state = bucketsAddItem(state, MEASURES, {
                attribute: "sample.attribute.bar",
                type: METRIC,
                localIdentifier: "m2",
            });
            state = bucketsAddItem(state, MEASURES, {
                type: METRIC,
                operator: ArithmeticOperatorType.CHANGE,
                operandLocalIdentifiers: ["m1", "m2"],
            });

            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.arithmetic_measure)");
        });
    });

    describe("measure value filter", () => {
        it("should disable export with text message when there is measure value filter applied", () => {
            state = rootReducer(state, addFiltersToState([comparisonMeasureValueFilter], true));
            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.measure_value_filter)");
        });
    });

    describe("ranking filter", () => {
        it("should disable export with text message when there is ranking filter applied", () => {
            state = rootReducer(state, addFiltersToState([rankingFilterWithoutAttributes], true));
            const { isExportDisabled, bubbleTextProvider } = exportButtonSelector(state);

            expect(isExportDisabled).toEqual(true);
            const fakeBubbleText = bubbleTextProvider(fakeIntl);
            expect(fakeBubbleText).toEqual("(translated export_unsupported.ranking_filter)");
        });
    });
});
