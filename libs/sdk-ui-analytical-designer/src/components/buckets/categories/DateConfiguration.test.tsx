// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { UiAsyncTableScrollbarWidth } from "@gooddata/sdk-ui-kit";

import { METRIC } from "../../../constants/bucket.js";
import { type IDecoratedDateDataset } from "../../../models/decorated_date_dataset.js";
import { type IDecoratedDateDatasets } from "../../../models/decorated_date_datasets.js";
import {
    GRANULARITY,
    GRANULARITY_OPTIONS,
    type IGranularityOption,
    isChronologicalDateGranularity,
} from "../../../models/granularity.js";
import { initialState } from "../../../reducers/initial_state.js";
import {
    decoratedDateDatasets,
    setupAppStateWithDateDatasets,
} from "../../../tests/constants.test.helpers.js";
import { withData, withRoot } from "../../../tests/state_builder.test.helpers.js";
import { type ICacheItemDisplayForm } from "../../../typings/state_objects.js";
import { getIntlOptions, mockIntlProp, withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import {
    DateConfigurationBase,
    DateConfigurationTest,
    type IDateConfigurationProps,
    type IDateConfigurationStateProps,
} from "./DateConfiguration.js";

const isNotFiscalGranularity = (granularityOption: IGranularityOption) =>
    !granularityOption.dateType.includes("fiscal");

const STANDARD_GRANULARITY_OPTIONS = GRANULARITY_OPTIONS.filter(isNotFiscalGranularity);

describe("DateConfiguration", () => {
    describe("component", () => {
        const dateDatasets: IDecoratedDateDatasets = {
            items: [
                {
                    identifier: "coca.cola",
                    title: "Coca-Cola",
                    relevance: 0,
                    ref: {
                        uri: "gdc/md/coca-cola",
                    },
                    isAvailable: true,
                },
                {
                    identifier: "zendesk",
                    title: "Zendesk",
                    relevance: 0,
                    ref: {
                        uri: "gdc/md/zendesk",
                    },
                    isAvailable: true,
                },
            ],
            unavailable: 0,
        };
        const selectedDateDataSet: IDecoratedDateDataset = {
            ref: {
                uri: "gdc/md",
            },
            identifier: "zendesk",
            title: "Zendesk",
            relevance: 10,
            isAvailable: true,
        };
        const mockTranslations = {
            "gs.date.date-dataset.unrelated": "Unrelated",
            Unrelated: "Unrelated",
        };
        const intl = mockIntlProp(mockTranslations);
        const unrelatedDateDatasets: IDecoratedDateDataset[] = [
            {
                identifier: "unrelated_date_1",
                title: "Unrelated Date 1",
                relevance: 0,
                ref: {
                    uri: "gdc/md/unrelated_date_1",
                },
                isAvailable: false,
            },
            {
                identifier: "unrelated_date_1",
                title: "Unrelated Date 1",
                relevance: 0,
                ref: {
                    uri: "gdc/md/unrelated_date_1",
                },
                isAvailable: false,
            },
        ];

        function renderComponent(props: Partial<IDateConfigurationProps> = {}) {
            const defaultProps: IDateConfigurationProps = {
                showAllValuesVisible: false,
                localIdentifier: "myBucketItem",
                selectedDateDataSet,
                selectedGranularity: GRANULARITY.YEAR,
                granularities: STANDARD_GRANULARITY_OPTIONS,
                dateDatasets,
                setBucketItemDateDataset: vi.fn(),
                setBucketItemGranularity: vi.fn(),
                callLoadDateDatasetsToDateDropdown: vi.fn(),
                defaultDialogHeight: 200,
                isDateDatasetsDropdownLoaded: true,
                displayForms: [],
                intl,
                enableUnavailableItemsVisibility: false,
            };

            const Wrapped = withRedux(withIntl(DateConfigurationBase, getIntlOptions(mockTranslations)));
            return render(<Wrapped {...defaultProps} {...props} />);
        }

        describe("no date datasets available", () => {
            function createWrapper() {
                const emptyDateDataSets: IDecoratedDateDatasets = {
                    items: [],
                    unavailable: 0,
                };

                return renderComponent({ dateDatasets: emptyDateDataSets });
            }

            it("should render explanation if no datasets available", () => {
                createWrapper();
                expect(document.querySelectorAll(".s-no-date-available")).toHaveLength(1);
            });

            it("should hide the date datasets select", () => {
                createWrapper();
                expect(document.querySelectorAll(".s-date-dataset-switch")).toHaveLength(0);
            });

            it("should hide the granularity select", () => {
                createWrapper();
                expect(document.querySelectorAll(".s-date-granularity-switch")).toHaveLength(0);
            });
        });

        it("should render list with date datasets", () => {
            const setBucketItemDateDataset = vi.fn();
            renderComponent({ setBucketItemDateDataset });

            fireEvent.click(document.querySelector(".s-date-dataset-button"));

            const items = document.querySelectorAll(".gd-list-item");
            expect(items).toHaveLength(2);

            expect(items[0].textContent).toEqual("Coca-Cola");
            expect(items[1].textContent).toEqual("Zendesk");

            fireEvent.click(items[0]);

            expect(setBucketItemDateDataset).toHaveBeenCalledWith(
                { uri: "gdc/md/coca-cola" },
                "myBucketItem",
            );
        });

        it("should render list with granularity", () => {
            const setBucketItemGranularity = vi.fn();
            renderComponent({ setBucketItemGranularity });

            fireEvent.click(document.querySelector(".s-date-granularity-button"));
            const items = document.querySelectorAll(".s-granularity-item");

            expect(items[0].textContent).toEqual("Year");
            expect(items[1].textContent).toEqual("Quarter");
            expect(items[2].textContent).toEqual("Month");
            expect(items[3].textContent).toEqual("Week");
            expect(items[4].textContent).toEqual("Day");

            fireEvent.click(items[0]);

            expect(setBucketItemGranularity).toHaveBeenCalledWith("myBucketItem", GRANULARITY.YEAR);
        });

        it("should not skip week if rendered with derived measure present flag and week filtering is enabled", () => {
            renderComponent({
                isDateDatasetsDropdownLoaded: true,
            });
            fireEvent.click(document.querySelector(".s-date-granularity-button"));

            expect(document.querySelector(".s-week")).toBeInTheDocument();
        });

        describe("additional date attributes", () => {
            it("should not render additional date attributes when none are enabled", () => {
                renderComponent({
                    granularities: GRANULARITY_OPTIONS.filter(isChronologicalDateGranularity),
                });
                fireEvent.click(document.querySelector(".s-date-granularity-button"));

                expect(document.querySelector(".s-granularity-more-options")).not.toBeInTheDocument();
            });

            it("should render additional date attributes when ff is enabled, additional weeks date attributes are not affected by week ff=false", () => {
                renderComponent();
                fireEvent.click(document.querySelector(".s-date-granularity-button"));

                expect(document.querySelector(".s-granularity-more-options")).toBeInTheDocument();
            });

            it("should mark More options as selected when additional date attribute is selected", () => {
                renderComponent({
                    selectedGranularity: GRANULARITY.MONTH_IN_YEAR,
                });
                fireEvent.click(document.querySelector(".s-date-granularity-button"));

                expect(document.querySelector(".s-granularity-more-options.is-selected")).toBeInTheDocument();
            });
        });

        describe("alternative display forms", () => {
            const availableDisplayForms: ICacheItemDisplayForm[] = [
                {
                    title: "Long text",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/1"),
                    id: "attr.opportunity.text",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/1",
                    type: undefined,
                },
                {
                    title: "Short text",
                    ref: uriRef("/gdc/md/TeamOneGoodSales1/obj/2"),
                    id: "attr.opportunity.text.short",
                    uri: "/gdc/md/TeamOneGoodSales1/obj/2",
                    type: undefined,
                },
            ];

            it("should not render display forms dropdown when ff is disabled", () => {
                renderComponent();
                const displayFormDropdown = document.querySelector(".s-date-configuration-display-form");
                expect(displayFormDropdown).not.toBeInTheDocument();
            });

            it("should not render display forms dropdown there is only one display form available", () => {
                renderComponent({
                    displayForms: [availableDisplayForms[0]],
                    selectedDisplayForm: availableDisplayForms[0].ref,
                });
                const displayFormDropdown = document.querySelector(".s-date-configuration-display-form");
                expect(displayFormDropdown).not.toBeInTheDocument();
            });

            it("should render display forms dropdown when there are at least two display forms to choose from", () => {
                renderComponent({
                    displayForms: availableDisplayForms,
                    selectedDisplayForm: availableDisplayForms[0].ref,
                });
                const displayFormDropdown = document.querySelector(".s-date-configuration-display-form");
                expect(displayFormDropdown).toBeInTheDocument();
            });
        });

        describe("Show all values option", () => {
            it("should show the show all values checkbox", () => {
                renderComponent({
                    showAllValues: true,
                    showAllValuesVisible: true,
                });

                const checkbox = document.querySelector(".s-show-all-values");

                expect(checkbox).toBeChecked();
            });

            it("should call the onChangeShowAllValues when the checkbox was clicked", () => {
                const onChangeShowAllValues = vi.fn();

                renderComponent({
                    showAllValues: false,
                    showAllValuesVisible: true,
                    onChangeShowAllValues,
                });

                const checkbox = document.querySelector(".s-show-all-values");
                fireEvent.click(checkbox);

                expect(onChangeShowAllValues).toHaveBeenCalledWith(true);
            });
        });

        describe("Unrelated date datasets", () => {
            it("should render unrelated date items when the enableUnavailableItemsVisibility is turned on", () => {
                renderComponent({
                    enableUnavailableItemsVisibility: true,
                    dateDatasets: {
                        items: [...dateDatasets.items, ...unrelatedDateDatasets],
                        unavailable: 2,
                    },
                });

                fireEvent.click(document.querySelector(".s-date-dataset-button"));
                const showUnavailableItemsBtn = document.querySelector(".gd-button-link-dimmed.s-show");

                expect(showUnavailableItemsBtn).toBeInTheDocument();

                fireEvent.click(showUnavailableItemsBtn);

                const items = document.querySelectorAll(".gd-list-item");
                const headerItem = document.querySelector(".gd-list-item-header");
                const unrelatedItems = document.querySelectorAll(".is-unrelated");

                expect(items).toHaveLength(5);
                expect(headerItem.innerHTML).toBe("Unrelated");
                expect(unrelatedItems).toHaveLength(2);
            });

            it("should render unrelated date items by default when the enableUnavailableItemsVisibility is turned on and the selected item is an unrelated item", () => {
                renderComponent({
                    enableUnavailableItemsVisibility: true,
                    selectedDateDataSet: unrelatedDateDatasets[0],
                    dateDatasets: {
                        items: [...dateDatasets.items, ...unrelatedDateDatasets],
                        unavailable: 2,
                    },
                });

                fireEvent.click(document.querySelector(".s-date-dataset-button"));
                const showUnavailableItemsBtn = document.querySelector(".gd-button-link-dimmed.s-show");
                const hideUnavailableItemsBtn = document.querySelector(".gd-button-link-dimmed.s-hide");

                expect(showUnavailableItemsBtn).not.toBeInTheDocument();
                expect(hideUnavailableItemsBtn).toBeInTheDocument();

                const items = document.querySelectorAll(".gd-list-item");
                const headerItem = document.querySelector(".gd-list-item-header");
                const unrelatedItems = document.querySelectorAll(".is-unrelated");

                expect(items).toHaveLength(5);
                expect(headerItem.innerHTML).toBe("Unrelated");
                expect(unrelatedItems).toHaveLength(2);
            });
        });

        describe("date-dataset dropdown width", () => {
            afterEach(() => {
                vi.restoreAllMocks();
            });

            function mockElementRects(triggerWidth: number) {
                return vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
                    this: Element,
                ) {
                    const base = {
                        bottom: 0,
                        height: 23,
                        top: 0,
                        x: 0,
                        y: 0,
                        toJSON: (): null => null,
                    };
                    if (this.classList.contains("s-date-dataset-width-probe")) {
                        const width = (this.textContent ?? "").length * 8;
                        return { ...base, width, left: 0, right: width };
                    }
                    if (this.querySelector?.("#date-dataset-dropdown")) {
                        return { ...base, width: triggerWidth, left: 100, right: 100 + triggerWidth };
                    }
                    return { ...base, width: 0, left: 0, right: 0 };
                });
            }

            function openDropdown() {
                fireEvent.click(document.querySelector(".s-date-dataset-button"));
            }

            function getListWidth(): number {
                const list = document.querySelector<HTMLElement>(".s-date-datasets-list");
                return Number(list.style.width.replace("px", ""));
            }

            it("grows the open list wider than the trigger to fit a dataset name that still fits under the cap", () => {
                mockElementRects(80);
                const title = "Date dataset with a super long name ABCXYZ";
                renderComponent({
                    dateDatasets: {
                        items: [
                            {
                                identifier: "long",
                                title,
                                relevance: 0,
                                ref: { uri: "gdc/md/long" },
                                isAvailable: true,
                            },
                        ],
                        unavailable: 0,
                    },
                });

                openDropdown();

                expect(getListWidth()).toEqual(title.length * 8);
            });

            it("reserves extra width for the list scrollbar when items overflow the list's max height", () => {
                mockElementRects(80);
                const title = "Some Longer Title";
                renderComponent({
                    dateDatasets: {
                        items: Array.from({ length: 6 }, (_, index) => ({
                            identifier: `item-${index}`,
                            title: index === 0 ? title : "Q1",
                            relevance: 0,
                            ref: { uri: `gdc/md/item-${index}` },
                            isAvailable: true,
                        })),
                        unavailable: 0,
                    },
                });

                openDropdown();

                expect(getListWidth()).toEqual(title.length * 8 + UiAsyncTableScrollbarWidth);
            });

            it("caps the open list width at 350px for a name that would otherwise exceed it", () => {
                mockElementRects(80);
                const veryLongTitle =
                    "An extremely long date dataset name that will never fit within the three hundred fifty pixel cap";
                renderComponent({
                    dateDatasets: {
                        items: [
                            {
                                identifier: "verylong",
                                title: veryLongTitle,
                                relevance: 0,
                                ref: { uri: "gdc/md/verylong" },
                                isAvailable: true,
                            },
                        ],
                        unavailable: 0,
                    },
                });

                openDropdown();

                expect(getListWidth()).toEqual(350);
            });

            it("never shrinks the open list below the trigger width", () => {
                mockElementRects(220);
                renderComponent({
                    dateDatasets: {
                        items: [
                            {
                                identifier: "short",
                                title: "Q1",
                                relevance: 0,
                                ref: { uri: "gdc/md/short" },
                                isAvailable: true,
                            },
                        ],
                        unavailable: 0,
                    },
                });

                openDropdown();

                expect(getListWidth()).toEqual(220);
            });
        });
    });

    describe("selector", () => {
        it("should return expected DateConfiguration state props", () => {
            let state = setupAppStateWithDateDatasets(initialState);
            state = withRoot(
                withData(state, {
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    type: METRIC,
                                    localIdentifier: "m1",
                                    masterLocalIdentifier: "m2",
                                },
                                {
                                    type: METRIC,
                                    localIdentifier: "m2",
                                },
                            ],
                        },
                    ],
                }),
                {
                    featureFlags: {
                        enableAdAdditionalDateAttributes: true,
                    },
                },
            );

            const expectedDateConfigurationProps: IDateConfigurationStateProps = {
                dateDatasets: decoratedDateDatasets,
                isDateDatasetsDropdownLoaded: true,
                showAllValuesVisible: false,
                intl: expect.any(Object),
                enableUnavailableItemsVisibility: false,
            };

            const result = DateConfigurationTest.dateConfigurationSelector(state);
            expect(result).toEqual(expectedDateConfigurationProps);
        });
    });
});
