// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IMeasureValueFilter } from "../../store/filter_bar/filter_bar_types.js";
import { comparisonMeasureValueFilter, emptyMeasureValueFilter } from "../../tests/filter.test.helpers.js";
import { type ICatalogEntries } from "../../typings/state_objects.js";
import { mockIntlProp, withIntl } from "../../utils/with_intl.js";

import { getWarningMessage } from "./measure_value_filter_item_utils.js";
import { type IMeasureValueFilterItemProps, MeasureValueFilterItemBase } from "./MeasureValueFilterItem.js";

const MEASURE_TITLE = "Measure";
const MEASURE_ALIAS = "Renamed";
const MEASURE_LOCAL_IDENTIFIER = "m1";

const COMPARISON_MEASURE_VALUE_FILTER: IMeasureValueFilter = {
    ...comparisonMeasureValueFilter,
    measureLocalIdentifier: MEASURE_LOCAL_IDENTIFIER,
};

const EMPTY_MEASURE_VALUE_FILTER: IMeasureValueFilter = {
    ...emptyMeasureValueFilter,
    measureLocalIdentifier: MEASURE_LOCAL_IDENTIFIER,
};

function createComponent(customProps?: Partial<IMeasureValueFilterItemProps>, alias?: string) {
    const measureDescriptions = {
        [MEASURE_LOCAL_IDENTIFIER]: {
            alias: alias || null,
            title: MEASURE_TITLE,
            isFormattedAsPercentage: false,
            showInPercent: false,
        },
    };

    const measureSequenceNumbers = {
        [MEASURE_LOCAL_IDENTIFIER]: 1,
    };

    const props: IMeasureValueFilterItemProps = {
        measureDescriptions,
        measureSequenceNumbers,
        updateMeasureValueFilter: () => {},
        filter: EMPTY_MEASURE_VALUE_FILTER,
        onDropdownOpened: () => {},
        isVisualizationStackingToPercent: false,
        isOptionalStackingDisabled: false,
        secondaryAxisMeasures: [],
        separators: { thousand: ",", decimal: "." },
        aboutToBeRemovedBucketAndFilterItems: [],
        enableOperatorSelection: true,
        // keyed `<type>.<identifier>` — this is the shape the `metric.<id>` lookup expects
        itemCache: {
            [`metric.${MEASURE_LOCAL_IDENTIFIER}`]: {
                title: MEASURE_TITLE,
            },
        } as ICatalogEntries,
        bucketItemNames: {},
        insightDimensionalityItems: {},
        projectId: "test",
        insight: undefined,
        datasetId: undefined,
        includeObjectsWithTags: undefined,
        excludeObjectsWithTags: undefined,
        enableRankingWithMvf: false,
        computedAttributesEnabled: false,
    };

    const Wrapped = withIntl(MeasureValueFilterItemBase);
    return render(<Wrapped {...props} {...customProps} />);
}

describe("MeasureValueFilterItem", () => {
    describe("filter item button", () => {
        it("should render measure title if measure is not renamed", () => {
            const { container } = createComponent();
            expect(container.querySelector(".s-mvf-measure-name").textContent).toEqual("Measure (M1)");
        });

        it("should render measure alias if measure is renamed", () => {
            const { container } = createComponent({}, MEASURE_ALIAS);
            expect(container.querySelector(".s-mvf-measure-name").textContent).toEqual("Renamed (M1)");
        });

        it("should render provided class", () => {
            const propagatedClassName = "s-test-filter";
            const { container } = createComponent({
                className: propagatedClassName,
            });
            expect(container.querySelector(`.${propagatedClassName}`)).toBeTruthy();
        });

        it("should not have `is-active` class when filter is closed", () => {
            const { container } = createComponent();
            expect(container.querySelector(".is-active")).toBeFalsy();
        });

        it("should have `is-active` class when filter is opened", () => {
            const { container } = createComponent();
            fireEvent.click(container.querySelector(".s-filter-button"));
            expect(container.querySelector(".is-active")).toBeTruthy();
        });

        it("should open the dropdown right away when the filter was just added", () => {
            const onDropdownOpened = vi.fn();
            const { container } = createComponent({ isAutoOpen: true, onDropdownOpened });

            expect(container.querySelector(".is-active")).toBeTruthy();
            expect(onDropdownOpened).toHaveBeenCalledWith(EMPTY_MEASURE_VALUE_FILTER);
        });

        it("should report the auto-opened dropdown closed when the button toggles it", () => {
            const onClose = vi.fn();
            const { container } = createComponent({ isAutoOpen: true, onClose });

            fireEvent.click(container.querySelector(".s-filter-button"));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(container.querySelector(".is-active")).toBeFalsy();
        });

        it("should not be highlighted by default", () => {
            const { container } = createComponent();
            expect(container.querySelector(".highlight")).toBeFalsy();
        });

        it("should be highlighted when highlight property is set", () => {
            const { container } = createComponent({
                isHighlighted: true,
            });
            expect(container.querySelector(".highlight")).toBeTruthy();
        });

        it("should display value in default mode if the measure is in percentage format and with percentage flags on", () => {
            const updateMeasureValueFilter = vi.fn();
            const props = {
                filter: COMPARISON_MEASURE_VALUE_FILTER,
                updateMeasureValueFilter,
                measureDescriptions: {
                    m1: {
                        title: MEASURE_TITLE,
                        isFormattedAsPercentage: true,
                        showInPercent: true,
                    },
                },
                isVisualizationStackingToPercent: true,
                intl: mockIntlProp(),
            };
            const { container } = createComponent(props);
            expect(container.querySelector(".s-mvf-configuration").textContent).toEqual("> 12");
        });

        it("should display value in percentage mode if the measure is in percentage format and with no percentage flags on", () => {
            const updateMeasureValueFilter = vi.fn();
            const props = {
                filter: COMPARISON_MEASURE_VALUE_FILTER,
                updateMeasureValueFilter,
                measureDescriptions: {
                    m1: {
                        title: MEASURE_TITLE,
                        isFormattedAsPercentage: true,
                        showInPercent: false,
                    },
                },
                isVisualizationStackingToPercent: false,
                intl: mockIntlProp(),
            };
            const { container } = createComponent(props);
            expect(container.querySelector(".s-mvf-configuration").textContent).toEqual("> 1.2K%");
        });

        it("should have `adi-metric-value-filter` and `s-metric-value-filter-item` class", () => {
            const { container } = createComponent();
            expect(container.querySelector(".adi-metric-value-filter")).toBeTruthy();
            expect(container.querySelector(".s-metric-value-filter-item")).toBeTruthy();
        });

        describe("aboutToBeRemovedBucketAndFilterItems", () => {
            it("should not highlight when aboutToBeRemovedBucketAndFilterItems is undefined", () => {
                const { container } = createComponent({
                    aboutToBeRemovedBucketAndFilterItems: undefined,
                });

                expect(container.querySelectorAll(".s-metric-value-filter-item")[0]).not.toHaveClass(
                    "about-to-be-removed",
                );
            });

            it("should not highlight when localIdentifier of filter is not in aboutToBeRemovedBucketAndFilterItems", () => {
                const { container } = createComponent({
                    aboutToBeRemovedBucketAndFilterItems: [],
                });
                expect(container.querySelectorAll(".s-metric-value-filter-item")[0]).not.toHaveClass(
                    "about-to-be-removed",
                );
            });

            it("should highlight when localIdentifier is in aboutToBeRemovedBucketAndFilterItems", () => {
                const { container } = createComponent({
                    aboutToBeRemovedBucketAndFilterItems: [emptyMeasureValueFilter.localIdentifier],
                });
                expect(container.querySelectorAll(".s-metric-value-filter-item")[0]).toHaveClass(
                    "about-to-be-removed",
                );
            });
        });

        describe("getWarningMessage", () => {
            const intlMock = mockIntlProp();
            const displayRankingFilterWarningMessage = true;
            const displayPercentWarningMessage = true;

            it("should return low severity warning message object when displayRankingFilterWarningMessage is true", () => {
                expect(
                    getWarningMessage(
                        intlMock,
                        displayRankingFilterWarningMessage,
                        displayPercentWarningMessage,
                    ),
                ).toHaveProperty("severity", "low");
            });

            it("should return medium severity warning message object when displayRankingFilterWarningMessage is false and displayPercentWarningMessage is true", () => {
                expect(getWarningMessage(intlMock, false, displayPercentWarningMessage)).toHaveProperty(
                    "severity",
                    "medium",
                );
            });

            it("should return null when displayRankingFilterWarningMessage and displayPercentWarningMessage are false", () => {
                expect(getWarningMessage(intlMock, false, false)).toEqual(null);
            });
        });

        describe("warning message", () => {
            it("should display warning message when operator selection is not enabled", () => {
                const { container } = createComponent({ enableOperatorSelection: false });

                expect(container.querySelector(".s-filter-warning")).toBeTruthy();
            });

            it("should display warning message when the measure is shown in percent", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: true,
                        },
                    },
                    isVisualizationStackingToPercent: false,
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".s-filter-warning")).toBeTruthy();
                expect(container.querySelector(".gd-bubble-trigger")).toBeTruthy();
            });

            it("should display warning message when the visualization is stacking to percent", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: false,
                        },
                    },
                    isVisualizationStackingToPercent: true,
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".s-filter-warning")).toBeTruthy();
                expect(container.querySelector(".gd-bubble-trigger")).toBeTruthy();
            });

            it("should not display warning message when operator selection is not enabled", () => {
                const { container } = createComponent({ enableOperatorSelection: true });

                expect(container.querySelector(".s-filter-warning")).toBeFalsy();
            });

            it("should not display warning message when the visualization is stacking to percent is not checked and the measure is not shown in percent", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: false,
                        },
                    },
                    isVisualizationStackingToPercent: false,
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".s-filter-warning")).toBeFalsy();
                expect(container.querySelector(".gd-bubble-trigger")).toBeFalsy();
            });

            it("should not display warning message when the visualization is stacking to percent and the measure is on secondary axis", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: false,
                        },
                    },
                    isVisualizationStackingToPercent: true,
                    secondaryAxisMeasures: [MEASURE_LOCAL_IDENTIFIER],
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".s-filter-warning")).toBeFalsy();
                expect(container.querySelector(".gd-bubble-trigger")).toBeFalsy();
            });

            it("should not display warning message when the visualization is stacking to percent and the optional stacking is disabled", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: false,
                        },
                    },
                    isVisualizationStackingToPercent: true,
                    isOptionalStackingDisabled: true,
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".s-filter-warning")).toBeFalsy();
                expect(container.querySelector(".gd-bubble-trigger")).toBeFalsy();
            });

            it("should not display warning message bubble nor shortened text bubble when the filter is being dragged", () => {
                const updateMeasureValueFilter = vi.fn();
                const props = {
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                    updateMeasureValueFilter,
                    measureDescriptions: {
                        m1: {
                            title: MEASURE_TITLE,
                            isFormattedAsPercentage: false,
                            showInPercent: false,
                        },
                    },
                    isVisualizationStackingToPercent: true,
                    isDraggedItem: true,
                    intl: mockIntlProp(),
                };
                const { container } = createComponent(props);
                expect(container.querySelector(".gd-bubble-trigger")).toBeFalsy();
            });
        });
    });

    describe("catalog measure percentage formatting", () => {
        const CATALOG_METRIC_ID = "catalogMetricId";
        const CATALOG_METRIC_REF = idRef(CATALOG_METRIC_ID);

        const catalogMeasureFilter: IMeasureValueFilter = {
            type: "measure",
            localIdentifier: "f_catalog",
            measureRef: CATALOG_METRIC_REF,
            conditions: [
                {
                    comparison: {
                        operator: "GREATER_THAN",
                        value: 12,
                    },
                },
            ],
        };

        it("should display value in percentage mode when catalog measure has percentage format", () => {
            const { container } = createComponent({
                filter: catalogMeasureFilter,
                measureDescriptions: {},
                itemCache: {
                    [`metric.${CATALOG_METRIC_ID}`]: {
                        title: "Catalog Metric",
                        format: "#,##0.00%",
                    },
                } as ICatalogEntries,
            });

            expect(container.querySelector(".s-mvf-configuration").textContent).toEqual("> 1.2K%");
        });

        it("should display value in default mode when catalog measure does not have percentage format", () => {
            const { container } = createComponent({
                filter: catalogMeasureFilter,
                measureDescriptions: {},
                itemCache: {
                    [`metric.${CATALOG_METRIC_ID}`]: {
                        title: "Catalog Metric",
                        format: "#,##0.00",
                    },
                } as ICatalogEntries,
            });

            expect(container.querySelector(".s-mvf-configuration").textContent).toEqual("> 12");
        });
    });

    describe("filter configuration", () => {
        it("should not render dropdown by default", () => {
            const { container } = createComponent();
            expect(container.querySelector(".s-mvf-dropdown-body")).toBeFalsy();
        });

        it("should render dropdown when filter item button is clicked upon", () => {
            const { container } = createComponent();

            fireEvent.click(container.querySelector(".s-filter-button"));
            expect(document.querySelector(".s-mvf-dropdown-body")).toBeTruthy();
        });

        it("should call onDropdownOpened when dropdown is opened", () => {
            const onDropdownOpened = vi.fn();
            const { container } = createComponent({
                onDropdownOpened,
                filter: COMPARISON_MEASURE_VALUE_FILTER,
            });

            expect(onDropdownOpened).not.toBeCalled();
            fireEvent.click(container.querySelector(".s-filter-button"));

            expect(onDropdownOpened).toBeCalledWith(COMPARISON_MEASURE_VALUE_FILTER);
        });

        describe("Cancel button", () => {
            it("should close configuration when clicked upon", () => {
                const { container } = createComponent();
                fireEvent.click(container.querySelector(".s-filter-button"));
                fireEvent.click(document.querySelector(".s-cancel"));
                expect(document.querySelector(".s-mvf-dropdown-body")).toBeFalsy();
            });

            it("should not call apply callback when clicked upon", () => {
                const updateMeasureValueFilter = vi.fn();
                const { container } = createComponent({ updateMeasureValueFilter });
                fireEvent.click(container.querySelector(".s-filter-button"));
                fireEvent.click(document.querySelector(".s-cancel"));

                expect(updateMeasureValueFilter).not.toHaveBeenCalled();
            });
        });

        describe("Apply button", () => {
            it("should send expected filter in callback when clicked upon", () => {
                const updateMeasureValueFilter = vi.fn();

                const { container } = createComponent({
                    updateMeasureValueFilter,
                    filter: COMPARISON_MEASURE_VALUE_FILTER,
                });

                fireEvent.click(container.querySelector(".s-filter-button"));
                fireEvent.click(document.querySelector(".s-mvf-operator-dropdown-button"));
                fireEvent.click(document.querySelector(".s-mvf-operator-less_than"));
                fireEvent.click(document.querySelector(".s-apply"));

                expect(document.querySelector(".s-mvf-dropdown-body")).toBeFalsy();

                const expectedFilter: IMeasureValueFilter = {
                    type: "measure",
                    localIdentifier: "f1",
                    measureLocalIdentifier: MEASURE_LOCAL_IDENTIFIER,
                    conditions: [
                        {
                            comparison: {
                                operator: "LESS_THAN",
                                value: 12,
                            },
                        },
                    ],
                };

                expect(updateMeasureValueFilter).toHaveBeenCalledWith(expectedFilter);
                expect(document.querySelector(".s-mvf-dropdown-body")).toBeFalsy();
            });
        });
    });
});
