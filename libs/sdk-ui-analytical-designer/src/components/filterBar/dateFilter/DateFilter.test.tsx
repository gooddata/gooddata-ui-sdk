// (C) 2022-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";
import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { type IAttributeFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../../store/types.js";
import {
    dateBucketItemRefs,
    decoratedClosedDateDatasetRef,
    decoratedDateDatasetsRef,
    setupAppStateWithDateDatasets,
} from "../../../tests/constants.test.helpers.js";
import {
    dateDataset1,
    dateDataset2,
    dateDataset3,
    dateDatasetRefsWithGranularities,
} from "../../../tests/DateDatasetWithGranularities.test.helpers.js";
import { getIntlOptions, withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { DateFilter } from "./DateFilter.js";
import { type IDateFilterOption } from "./dateFilterOptionFactory.js";
import { ALL_TIME_FILTER_OPTION, STATIC_PERIOD_FILTER_OPTION } from "./defaultFilterOptions.js";
import { RELATIVE_DATE_FILTER_PRESETS, findSupportedRelativePresets } from "./presets.js";
import { type IDateFilterProps, type IDateFilterStateProps } from "./types.js";

vi.hoisted(() => {
    vi.resetModules();
});

const { selectDateFilterPropsMock } = vi.hoisted(() => ({ selectDateFilterPropsMock: vi.fn() }));

// the additional date filter rows render the attribute filter, which loads elements
vi.mock("../../AttributeFilter/AttributeFilter", () => {
    return {
        AttributeFilter: vi.fn(() => <div className="s-filter-button" />),
    };
});

// DateFilter reads its state props from the store; the tests drive those props directly, so the
// (memoised) selector is stubbed and only the own props are passed to the rendered component.
vi.mock("./selectors.js", async (importOriginal) => {
    // oxlint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import("./selectors.js")>();
    return {
        ...actual,
        selectDateFilterProps: selectDateFilterPropsMock,
    };
});

function splitProps({
    filterLocalIdentifier,
    onApply,
    onClose,
    className,
    isDragged,
    isAutoOpen,
    ...stateProps
}: IDateFilterProps & IDateFilterStateProps) {
    const ownProps: IDateFilterProps = {
        filterLocalIdentifier,
        onApply,
        onClose,
        className,
        isDragged,
        isAutoOpen,
    };
    return { ownProps, stateProps };
}

const defaultProps: IDateFilterProps & IDateFilterStateProps = {
    filterLocalIdentifier: "f1",
    filter: {
        filterOption: ALL_TIME_FILTER_OPTION,
        excludeCurrentPeriod: false,
    },
    relativeDateFilterPresets: RELATIVE_DATE_FILTER_PRESETS,
    dateDataset: dateDataset1,
    dateDatasets: {
        items: [dateDataset1, dateDataset2, dateDataset3],
        unavailable: 0,
    },
    dateDatasetRefsWithGranularities: dateDatasetRefsWithGranularities,
    isDateDatasetDisabled: false,
    dateFormat: "MM/dd/yyyy",
    timeComparisonType: OverTimeComparisonTypes.NOTHING,
    timeComparisonMeasures: ["m1", "m2"],
    supportedTimeComparisonTypes: [
        OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        OverTimeComparisonTypes.PREVIOUS_PERIOD,
    ],
    isWeekFiltersEnabled: true,
    timeComparisonCompatibleMeasures: [
        {
            localIdentifier: "m1",
            title: "Measure A",
            sequenceNumber: 1,
        },
        {
            localIdentifier: "m2",
            title: "Measure B",
            sequenceNumber: 2,
        },
    ],
    isUsedByInsight: true,
    dateBucketItemDateDatasetRefs: [idRef("d1")],
    isDateDatasetsDropdownLoaded: true,
    areGenericDateAttributeElementsSupported: true,
    additionalDateAttributeFilters: [],
    additionalDateFilterLabels: [],
    migratedAdditionalFilters: [],
    onApply: vi.fn(),
    onClose: vi.fn(),
    isTimeForAbsoluteRangeEnabled: false,
    isSecondsGranularityEnabled: false,
    formatLocale: undefined,
    enableUnavailableItemsVisibility: false,
    activeCalendars: undefined,
    isFirstDateFilter: true,
};

const changeEvent = (value: string) => ({
    target: {
        value,
    },
});

const renderDateFilter = (customProps: Partial<IDateFilterProps & IDateFilterStateProps> = {}) => {
    const { ownProps, stateProps } = splitProps({ ...defaultProps, ...customProps });
    selectDateFilterPropsMock.mockReturnValue(stateProps);

    const LocalizedPresetsSection = withRedux(withIntl(DateFilter));
    return render(<LocalizedPresetsSection {...ownProps} />);
};

describe("DateFilter", () => {
    describe("Auto-open", () => {
        // the picker renders in an overlay outside the component's container
        const presetSection = () => document.querySelector(".s-preset-section");

        it("should mount with the picker open when the filter was just added", () => {
            renderDateFilter({ isAutoOpen: true });

            expect(presetSection()).toBeInTheDocument();
        });

        it("should keep the picker closed without the auto-open", () => {
            renderDateFilter({ isAutoOpen: false });

            expect(presetSection()).not.toBeInTheDocument();
        });

        it("should report the auto-opened picker closed on cancel and stay closed", () => {
            const onClose = vi.fn();
            const { getByText } = renderDateFilter({ isAutoOpen: true, onClose });

            fireEvent.click(getByText("Cancel"));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(presetSection()).not.toBeInTheDocument();
        });
    });

    describe("Exclude period", () => {
        it("should produce expected filter when period is not excluded from the currently selected preset", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText } = renderDateFilter({ onApply });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Last 4 quarters"));
            fireEvent.click(getByText("Apply"));

            expect(onApply).toBeCalledWith(
                expect.objectContaining({
                    filter: expect.objectContaining({
                        type: "relativePreset",
                        from: -3,
                        to: 0,
                    }),
                    isCurrentPeriodExcluded: false,
                }),
            );
        });

        it("should produce expected filter when period is excluded from the currently selected preset", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText } = renderDateFilter({ onApply });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Last 4 quarters"));
            fireEvent.click(getByLabelText("Exclude this quarter"));
            fireEvent.click(getByText("Apply"));

            expect(onApply).toBeCalledWith(
                expect.objectContaining({
                    filter: expect.objectContaining({
                        type: "relativePreset",
                        from: -4,
                        to: -1,
                    }),
                    isCurrentPeriodExcluded: true,
                }),
            );
        });
    });

    describe("Relative period", () => {
        it("should produce expected filter when relative period is setup", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText, getAllByPlaceholderText } = renderDateFilter({ onApply });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Relative period"));
            // start entering value into "to" field otherwise "from" dropdown is not opened in the test
            fireEvent.change(getAllByPlaceholderText("Type or select")[1], changeEvent("2"));
            fireEvent.click(getByText("2 months ago"));
            fireEvent.change(getAllByPlaceholderText("Type or select")[0], changeEvent("16"));
            fireEvent.click(getByText("16 months ago"));
            fireEvent.click(getByText("Apply"));

            expect(onApply).toBeCalledWith(
                expect.objectContaining({
                    filter: expect.objectContaining({
                        type: "relativeForm",
                        from: -16,
                        to: -2,
                    }),
                }),
            );
        });

        it("should produce expected normalized filter when relative period is setup with switched ranges (start after the end)", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText, getAllByPlaceholderText } = renderDateFilter({ onApply });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Relative period"));
            // start entering value into "to" field otherwise "from" dropdown is not opened in the test
            fireEvent.change(getAllByPlaceholderText("Type or select")[1], changeEvent("16"));
            fireEvent.click(getByText("16 months ago"));
            fireEvent.change(getAllByPlaceholderText("Type or select")[0], changeEvent("2"));
            fireEvent.click(getByText("2 months ago"));
            fireEvent.click(getByText("Apply"));

            expect(onApply).toBeCalledWith(
                expect.objectContaining({
                    filter: expect.objectContaining({
                        type: "relativeForm",
                        from: -16,
                        to: -2,
                    }),
                }),
            );
        });

        it("should accept date format in a given pattern only", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText } = renderDateFilter({
                dateFormat: "d. M. yyyy",
                onApply,
            });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Static period"));

            const startDate = getByLabelText("Start date");
            fireEvent.change(startDate, changeEvent("2. 1. 2022"));
            fireEvent.blur(startDate);
            const endDate = getByLabelText("End date");
            fireEvent.change(endDate, changeEvent("5. 3. 2022"));
            fireEvent.blur(endDate);

            fireEvent.click(getByText("Apply"));

            expect(onApply).toBeCalledWith(
                expect.objectContaining({
                    filter: expect.objectContaining({
                        type: "absoluteForm",
                        from: "2022-01-02",
                        to: "2022-03-05",
                    }),
                }),
            );
        });

        it("should display error message once date format does not follow the required pattern", () => {
            const onApply = vi.fn();
            const { getByText, getByLabelText } = renderDateFilter({
                dateFormat: "d. M. yyyy",
                onApply,
            });

            fireEvent.click(getByText("All time")); // open filter dropdown by clicking on filter btn
            fireEvent.click(getByLabelText("Period"));
            fireEvent.click(getByText("Static period"));

            const startDate = getByLabelText("Start date");
            fireEvent.change(startDate, changeEvent("2/1/2022"));
            fireEvent.blur(startDate);
            const endDate = getByLabelText("End date");
            fireEvent.change(endDate, changeEvent("5/3/2022"));
            fireEvent.blur(endDate);

            expect(getByText("Error: Invalid start date — use d. M. yyyy format.")).toBeInTheDocument();
        });
    });

    const customTranslations = { last_7_days: "last 7 days" };

    function initState(state: IAppState) {
        return setupAppStateWithDateDatasets(state);
    }

    const DateFilterWrapper = withRedux(withIntl(DateFilter, getIntlOptions(customTranslations)), initState);

    describe("actions", () => {
        function renderComponent(props: Partial<IDateFilterProps & IDateFilterStateProps> = {}) {
            const filter: IDateFilterOption = {
                filterOption: ALL_TIME_FILTER_OPTION,
                excludeCurrentPeriod: false,
            };

            const supportedOverTimeComparisonTypes: OverTimeComparisonType[] = [
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ];

            const defaultProps: IDateFilterProps & IDateFilterStateProps = {
                filterLocalIdentifier: "filterLocalIdentifier",
                filter,
                isFirstDateFilter: true,
                dateDataset: decoratedClosedDateDatasetRef,
                dateDatasets: decoratedDateDatasetsRef,
                dateDatasetRefsWithGranularities: [
                    {
                        ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed"),
                        attributes: [
                            {
                                ref: uriRef("/gdc/md/679"),
                                dfRef: uriRef("/gdc/md/680"),
                                cacheIdentifier: "closed.day.in.week",
                                dateType: "GDC.time.day_in_week",
                                label: "day_in_week",
                                valuesPreview: "day_in_week_preview",
                                chronologicalGranularity: "GDC.time.date",
                            },
                            {
                                ref: uriRef("/gdc/md/642"),
                                dfRef: uriRef("/gdc/md/643"),
                                cacheIdentifier: "closed.day.in.month",
                                dateType: "GDC.time.day_in_month",
                                label: "day_in_month",
                                valuesPreview: "day_in_month_preview",
                                chronologicalGranularity: "GDC.time.date",
                            },
                        ],
                    },
                    {
                        ref: uriRef("/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity"),
                        attributes: [
                            {
                                ref: uriRef("/gdc/md/779"),
                                dfRef: uriRef("/gdc/md/780"),
                                cacheIdentifier: "activity.day.in.week",
                                dateType: "GDC.time.day_in_week",
                                label: "day_in_week",
                                valuesPreview: "day_in_week_preview",
                                chronologicalGranularity: "GDC.time.date",
                            },
                            {
                                ref: uriRef("/gdc/md/742"),
                                dfRef: uriRef("/gdc/md/743"),
                                cacheIdentifier: "activity.day.in.month",
                                dateType: "GDC.time.day_in_month",
                                label: "day_in_month",
                                valuesPreview: "day_in_month_preview",
                                chronologicalGranularity: "GDC.time.date",
                            },
                        ],
                    },
                ],
                dateFormat: "MM/dd/yyyy",
                onApply: () => {},
                onClose: () => {},
                isDateDatasetDisabled: false,
                timeComparisonMeasures: [],
                timeComparisonCompatibleMeasures: [],
                isUsedByInsight: true,
                timeComparisonType: OverTimeComparisonTypes.NOTHING,
                supportedTimeComparisonTypes: supportedOverTimeComparisonTypes,
                isWeekFiltersEnabled: false,
                relativeDateFilterPresets: findSupportedRelativePresets(false),
                dateBucketItemDateDatasetRefs: [...dateBucketItemRefs],
                isDateDatasetsDropdownLoaded: false,
                areGenericDateAttributeElementsSupported: false,
                additionalDateAttributeFilters: [],
                additionalDateFilterLabels: [],
                migratedAdditionalFilters: [],
                isTimeForAbsoluteRangeEnabled: false,
                isSecondsGranularityEnabled: false,
                formatLocale: undefined,
                enableUnavailableItemsVisibility: false,
                activeCalendars: undefined,
            };
            const { ownProps, stateProps } = splitProps({ ...defaultProps, ...props });
            selectDateFilterPropsMock.mockReturnValue(stateProps);

            return render(<DateFilterWrapper {...ownProps} />);
        }

        function renderOpenedDropdown(props = {}) {
            renderComponent(props);
            fireEvent.click(document.querySelector(".s-filter-button"));
        }

        function selectItemFromDropdownPortal(identifier: string) {
            fireEvent.click(document.querySelector(identifier));
        }

        function openDatePresetsDropdown() {
            fireEvent.click(document.querySelector(".s-date-preset-button"));
        }

        function openDateDatasetDropdown() {
            fireEvent.click(document.querySelector(".s-date-dataset-button"));
        }

        function openComparisonTypesDropdown() {
            fireEvent.click(document.querySelector(".s-comparison-types-button"));
        }

        describe("selecting date dataset", () => {
            it("should not close dropdown", () => {
                renderOpenedDropdown({ isDateDatasetsDropdownLoaded: true });

                openDateDatasetDropdown();
                selectItemFromDropdownPortal(".s-week_year__activity_");

                expect(document.querySelector(".s-filter-picker")).toBeInTheDocument();
            });

            describe("with additional date filters", () => {
                const dayInWeekFilter: IAttributeFilter = {
                    type: "attribute",
                    localIdentifier: "additional.dayInWeek",
                    cacheItemIdentifier: "closed.day.in.week",
                    displayFormRef: uriRef("/gdc/md/680"),
                    filterConfig: {
                        isInverted: false,
                        totalElementsCount: 7,
                        selectedElements: [{ title: "Mon", uri: "2", available: true }],
                    },
                };
                const withAdditionalFilters = {
                    isDateDatasetsDropdownLoaded: true,
                    areGenericDateAttributeElementsSupported: true,
                    additionalDateAttributeFilters: [dayInWeekFilter],
                };
                const getRows = () => document.querySelectorAll(".s-adi-additional-date-attribute");
                const getWarningPanel = () =>
                    document.querySelector(
                        ".s-additional-filter-reset-warning, .s-additional-filter-reset-warnings",
                    );

                it("keeps a filter the new dataset has the granularity for, without a warning", () => {
                    renderOpenedDropdown(withAdditionalFilters);
                    expect(getRows()).toHaveLength(1);

                    openDateDatasetDropdown();
                    selectItemFromDropdownPortal(".s-week_year__activity_");

                    expect(getRows()).toHaveLength(1);
                    expect(getWarningPanel()).not.toBeInTheDocument();
                });

                it("removes a filter the new dataset lacks the granularity for and warns about it", () => {
                    renderOpenedDropdown({
                        ...withAdditionalFilters,
                        // Activity without Day of Week: the only date-type match is gone
                        dateDatasetRefsWithGranularities: [
                            {
                                ref: uriRef(
                                    "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.closed",
                                ),
                                attributes: [
                                    {
                                        ref: uriRef("/gdc/md/679"),
                                        dfRef: uriRef("/gdc/md/680"),
                                        cacheIdentifier: "closed.day.in.week",
                                        dateType: "GDC.time.day_in_week",
                                        label: "day_in_week",
                                        valuesPreview: "day_in_week_preview",
                                        chronologicalGranularity: "GDC.time.date",
                                    },
                                ],
                            },
                            {
                                ref: uriRef(
                                    "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
                                ),
                                attributes: [
                                    {
                                        ref: uriRef("/gdc/md/742"),
                                        dfRef: uriRef("/gdc/md/743"),
                                        cacheIdentifier: "activity.day.in.month",
                                        dateType: "GDC.time.day_in_month",
                                        label: "day_in_month",
                                        valuesPreview: "day_in_month_preview",
                                        chronologicalGranularity: "GDC.time.date",
                                    },
                                ],
                            },
                        ],
                    });

                    openDateDatasetDropdown();
                    selectItemFromDropdownPortal(".s-week_year__activity_");

                    expect(getRows()).toHaveLength(0);
                    expect(document.querySelector(".s-additional-filter-reset-warning")).toBeInTheDocument();
                });

                describe("the warning", () => {
                    const dataset = (identifier: string, title: string) => ({
                        identifier,
                        ref: idRef(identifier),
                        title,
                        isAvailable: true,
                    });
                    const granularity = (
                        dataset: string,
                        dateType: "GDC.time.day_in_week" | "GDC.time.day_in_month" | "GDC.time.day_in_year",
                        label: string,
                    ) => ({
                        ref: idRef(`${dataset}.${label}`),
                        dfRef: idRef(`${dataset}.${label}.df`),
                        cacheIdentifier: `${dataset}.${label}`,
                        dateType,
                        label,
                        valuesPreview: `${label}_preview`,
                        chronologicalGranularity: "GDC.time.date" as const,
                    });
                    const selection = (title: string) => ({
                        isInverted: false,
                        totalElementsCount: 7,
                        selectedElements: [{ title, uri: "1", available: true }],
                    });
                    const first = dataset("first", "First");
                    const second = dataset("second", "Second");
                    const third = dataset("third", "Third");
                    // first -> second drops Day of Week; second -> third drops Day of Year
                    const withThreeDatasets = {
                        isDateDatasetsDropdownLoaded: true,
                        areGenericDateAttributeElementsSupported: true,
                        dateDataset: first,
                        dateDatasets: { items: [first, second, third], unavailable: 0 },
                        dateDatasetRefsWithGranularities: [
                            {
                                ref: idRef("first"),
                                attributes: [
                                    granularity("first", "GDC.time.day_in_week", "day_in_week"),
                                    granularity("first", "GDC.time.day_in_month", "day_in_month"),
                                    granularity("first", "GDC.time.day_in_year", "day_in_year"),
                                ],
                            },
                            {
                                ref: idRef("second"),
                                attributes: [
                                    granularity("second", "GDC.time.day_in_month", "day_in_month"),
                                    granularity("second", "GDC.time.day_in_year", "day_in_year"),
                                ],
                            },
                            {
                                ref: idRef("third"),
                                attributes: [
                                    granularity("third", "GDC.time.day_in_week", "day_in_week"),
                                    granularity("third", "GDC.time.day_in_month", "day_in_month"),
                                ],
                            },
                        ],
                        additionalDateAttributeFilters: [
                            {
                                ...dayInWeekFilter,
                                cacheItemIdentifier: "first.day_in_week",
                                displayFormRef: idRef("first.day_in_week.df"),
                            },
                            {
                                type: "attribute" as const,
                                localIdentifier: "additional.dayInMonth",
                                cacheItemIdentifier: "first.day_in_month",
                                displayFormRef: idRef("first.day_in_month.df"),
                                filterConfig: selection("1"),
                            },
                            {
                                type: "attribute" as const,
                                localIdentifier: "additional.dayInYear",
                                cacheItemIdentifier: "first.day_in_year",
                                displayFormRef: idRef("first.day_in_year.df"),
                                filterConfig: selection("100"),
                            },
                        ],
                    };
                    const pickDataset = (className: string) => {
                        openDateDatasetDropdown();
                        selectItemFromDropdownPortal(`.s-date-datasets-list ${className}`);
                    };
                    const removeRow = (label: string) =>
                        fireEvent.click(
                            document.querySelector(
                                `.s-adi-additional-date-attribute-${label} .s-remove-attribute-filter`,
                            ),
                        );

                    it("goes away on removing an additional filter and comes back on another dimension change", () => {
                        renderOpenedDropdown(withThreeDatasets);

                        pickDataset(".s-second");
                        expect(getWarningPanel()).toBeInTheDocument();

                        removeRow("day_in_month");
                        expect(getWarningPanel()).not.toBeInTheDocument();

                        pickDataset(".s-third");
                        expect(getRows()).toHaveLength(0);
                        expect(getWarningPanel()).toBeInTheDocument();
                    });

                    it("goes away on changing the period", () => {
                        renderOpenedDropdown(withThreeDatasets);

                        pickDataset(".s-second");
                        expect(getWarningPanel()).toBeInTheDocument();

                        openDatePresetsDropdown();
                        selectItemFromDropdownPortal(".s-date-presets-list .s-preset-absolute-form");

                        expect(getWarningPanel()).not.toBeInTheDocument();
                    });
                    it("goes away on changing the comparison", () => {
                        renderOpenedDropdown({
                            ...withThreeDatasets,
                            // a period and a dataset the date bucket item uses, so the comparison is offered
                            filter: {
                                filterOption: STATIC_PERIOD_FILTER_OPTION,
                                excludeCurrentPeriod: false,
                            },
                            dateBucketItemDateDatasetRefs: [idRef("second")],
                        });

                        pickDataset(".s-second");
                        expect(getWarningPanel()).toBeInTheDocument();

                        openComparisonTypesDropdown();
                        selectItemFromDropdownPortal(".s-compare-types-list .s-same_period_previous_year");

                        expect(getWarningPanel()).not.toBeInTheDocument();
                    });
                    it("stays when the period resets itself because the new dimension lacks its granularity", () => {
                        const [firstDataset, ...otherDatasets] =
                            withThreeDatasets.dateDatasetRefsWithGranularities;
                        renderOpenedDropdown({
                            ...withThreeDatasets,
                            // only First has a Date granularity, so a relative period by date falls back
                            // to the default one on Second
                            dateDatasetRefsWithGranularities: [
                                {
                                    ...firstDataset,
                                    attributes: [
                                        ...firstDataset.attributes,
                                        {
                                            ref: idRef("first.date"),
                                            dfRef: idRef("first.date.df"),
                                            cacheIdentifier: "first.date",
                                            dateType: "GDC.time.date",
                                            label: "date",
                                            valuesPreview: "date_preview",
                                            chronologicalGranularity: "GDC.time.date",
                                        },
                                    ],
                                },
                                ...otherDatasets,
                            ],
                            filter: {
                                filterOption: {
                                    localIdentifier: "RELATIVE_FORM",
                                    type: "relativeForm",
                                    granularity: "GDC.time.date",
                                    from: -1,
                                    to: 0,
                                    name: "",
                                    visible: true,
                                },
                                excludeCurrentPeriod: false,
                            },
                        });
                        pickDataset(".s-second");

                        expect(getWarningPanel()).toBeInTheDocument();
                    });

                    it("goes away when a later dimension change has every granularity", () => {
                        renderOpenedDropdown(withThreeDatasets);

                        pickDataset(".s-second");
                        expect(
                            document.querySelector(".s-additional-filter-reset-warning"),
                        ).toBeInTheDocument();

                        // back on a dataset with Day of Week: the change is an edit, so the warning is dismissed
                        pickDataset(".s-first");
                        expect(getRows()).toHaveLength(2);
                        expect(
                            document.querySelector(".s-additional-filter-reset-warning"),
                        ).not.toBeInTheDocument();
                    });
                    it("reports only the filters the latest dimension change removes", () => {
                        renderOpenedDropdown(withThreeDatasets);

                        pickDataset(".s-second");
                        pickDataset(".s-third");

                        expect(getRows()).toHaveLength(1);
                        expect(
                            document.querySelector(".s-additional-filter-reset-warning"),
                        ).toBeInTheDocument();
                        expect(
                            document.querySelector(".s-additional-filter-reset-warnings"),
                        ).not.toBeInTheDocument();
                    });

                    it("goes away on adding the empty values filter", () => {
                        renderOpenedDropdown(withThreeDatasets);

                        pickDataset(".s-second");
                        expect(getWarningPanel()).toBeInTheDocument();

                        fireEvent.click(
                            document.querySelector(".s-adi-additional-date-granularities-dropdown-button"),
                        );
                        fireEvent.click(document.querySelector(".s-adi-empty-values-filter-item"));

                        expect(getWarningPanel()).not.toBeInTheDocument();
                    });
                });
            });
        });

        describe("selecting compare apply on measures", () => {
            it("should render OverTimeComparisonApplyOnDropdown when some comparison type is selected from types dropdown", () => {
                renderOpenedDropdown({
                    timeComparisonMeasures: ["m1"],
                });

                openDatePresetsDropdown();
                selectItemFromDropdownPortal(".s-date-presets-list .s-preset-absolute-form");

                openComparisonTypesDropdown();
                selectItemFromDropdownPortal(".s-compare-types-list .s-same_period_previous_year");

                expect(document.querySelector(".s-compare-apply-measures-button")).toBeInTheDocument();
            });

            it("should not render OverTimeComparisonApplyOnDropdown when nothing is selected from types dropdown", () => {
                renderOpenedDropdown({
                    timeComparisonMeasures: ["m1"],
                });

                openComparisonTypesDropdown();
                selectItemFromDropdownPortal(".s-compare-types-list .s-nothing");

                expect(document.querySelector(".s-compare-apply-measures-button")).not.toBeInTheDocument();
            });
        });

        describe("selecting comparison type", () => {
            it("should render OverTimeComparisonTypesDropdown", () => {
                renderOpenedDropdown({
                    timeComparisonMeasures: ["m1"],
                });

                expect(document.querySelector(".s-comparison-types-button")).toBeInTheDocument();
            });

            it("should render amount of given supported comparison types in dropdown including 'Nothing'", () => {
                const supportedTimeComparisonTypes = [
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                ];
                renderOpenedDropdown({
                    supportedTimeComparisonTypes,
                });

                openComparisonTypesDropdown();

                const supportedCompareTypesIncludingNothing = 3;
                expect(document.querySelectorAll(".gd-list-item")).toHaveLength(
                    supportedCompareTypesIncludingNothing,
                );
            });

            describe("no comparison types warning message", () => {
                it("should render warning message when no comparison types are supported", () => {
                    renderOpenedDropdown({
                        supportedTimeComparisonTypes: [],
                    });
                    expect(document.querySelector(".s-date-filter-error-message")).toBeInTheDocument();
                });

                it("should not render warning message when some comparison types are supported", () => {
                    renderOpenedDropdown({
                        supportedTimeComparisonTypes: [OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR],
                    });

                    expect(document.querySelector(".s-date-filter-error-message")).not.toBeInTheDocument();
                });
            });

            it("should set flag isAllTimeDateFilter to dropdown component when All time period is picked (default option)", () => {
                const supportedTimeComparisonTypes = [
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                ];
                renderOpenedDropdown({
                    supportedTimeComparisonTypes,
                });

                openComparisonTypesDropdown();

                expect(document.querySelector(".s-previous_period")).toHaveClass("is-disabled");
            });
        });

        describe("cancel", () => {
            it("should close the dropdown", () => {
                renderOpenedDropdown();

                fireEvent.click(document.querySelector(".s-date-filter-cancel"));
                expect(document.querySelector(".s-filter-picker")).not.toBeInTheDocument();
            });

            it("should call onClose when the dropdown is closed", () => {
                const onClose = vi.fn();
                renderOpenedDropdown({ onClose });

                fireEvent.click(document.querySelector(".s-date-filter-cancel"));
                expect(onClose).toBeCalled();
            });

            it("should not call onApply", () => {
                const onApply = vi.fn();
                renderOpenedDropdown({ onApply });

                fireEvent.click(document.querySelector(".s-date-filter-cancel"));
                expect(onApply).not.toHaveBeenCalled();
            });
        });
    });
});
