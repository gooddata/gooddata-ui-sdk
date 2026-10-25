// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, waitFor } from "@testing-library/react";
import { range } from "lodash-es";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    uriRef,
} from "@gooddata/sdk-model";

import { addMessage } from "../../../actions/messages_actions.js";
import { MEASURES } from "../../../constants/bucket.js";
import { createDecoratedDateFilter } from "../../../models/date_filter.js";
import { newDecoratedBucketItem } from "../../../models/decorated_bucket_item.js";
import {
    type IDecoratedMetricAttributeFilter,
    createDecoratedMetricAttributeFilter,
} from "../../../models/decorated_metric_attribute_filter.js";
import {
    setBucketItemAddMetricFilters,
    setBucketItemRemoveMetricFilter,
} from "../../../store/bucket_filters/bucket_filters_actions.js";
import { type IAppState } from "../../../store/types.js";
import { closedDateDataset, seedDateDatasetsMeta } from "../../../tests/constants.test.helpers.js";
import { dateDatasetsMetaItems } from "../../../tests/date_datasets_meta.test.helpers.js";
import { withRoot } from "../../../tests/state_builder.test.helpers.js";
import { type IRawBucketItem } from "../../../typings/buckets.js";
import { type IDecoratedMetricFilters } from "../../../typings/measure_filters.js";
import { API } from "../../../utils/organized_catalog_api.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { type IMeasureFiltersProps, MeasureFilters } from "./MeasureFilters.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../AttributeFilter/AttributeFilter", () => {
    return {
        AttributeFilter: vi.fn(() => <div className="s-filter-button" />),
    };
});

const dispatchMock = vi.hoisted(() => vi.fn());
const capabilityMocks = vi.hoisted(() => ({
    areGenericDateAttributeElementsSupported: true,
    selectSupportsMultipleDateFilters: true,
}));

// the picker can only show and edit additional date filters on a backend with date attribute elements
vi.mock("../../../selectors/backend_capabilities_selector.js", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    areGenericDateAttributeElementsSupported: () => capabilityMocks.areGenericDateAttributeElementsSupported,
    selectSupportsMultipleDateFilters: () => capabilityMocks.selectSupportsMultipleDateFilters,
}));

// the component dispatches through useDispatch now; the store itself stays real (withRedux)
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useDispatch: () => dispatchMock,
    };
});

describe("MeasureFilters", () => {
    const defaultProps: IMeasureFiltersProps = {
        bucketLocalIdentifier: MEASURES,
    };

    function renderComponent(customProps: Partial<IMeasureFiltersProps>) {
        const Wrapped = withIntl(withRedux(MeasureFilters));

        const props = { ...defaultProps, ...customProps };

        return render(<Wrapped {...props} />);
    }

    beforeEach(() => {
        dispatchMock.mockClear();
    });

    afterEach(() => {
        // work-around to handle overlays
        document.body.innerHTML = "";
    });

    const bucketItemOriginal = { localIdentifier: "bucket-item-original" } as IRawBucketItem;
    const filterOriginal = {
        displayFormRef: uriRef("attribute/displayForm/uri"),
    };

    function createBucketItem(filters: IDecoratedMetricFilters = []) {
        return newDecoratedBucketItem({
            original: bucketItemOriginal,
            localIdentifier: bucketItemOriginal.localIdentifier,
            aggregation: "",
            attribute: {
                uri: "/bucket/item/attribute",
                type: "attribute",
                title: "Attribute",
            },
            filters,
        });
    }

    function createFilter(id: string): IDecoratedMetricAttributeFilter {
        return {
            ...createDecoratedMetricAttributeFilter(),
            attribute: { dfRef: { uri: id } },
            original: filterOriginal,
            selectedElements: [],
        };
    }

    describe("DateFilter", () => {
        const props = {
            ...defaultProps,
            bucketLocalIdentifier: MEASURES,
            bucketItem: createBucketItem(),
        };

        it("should render date filter picker when no date dataset exists", () => {
            const Wrapped = withRedux(withIntl(MeasureFilters));
            const { container } = render(<Wrapped {...props} />);

            expect(container.querySelectorAll(".s-metric-filter-wrapper")).toHaveLength(1);
        });

        it("should render date filter picker when some date datasets exists", () => {
            const customProps = {
                dateDatasets: { dateDataset: {} },
            };

            const Wrapped = withRedux(withIntl(MeasureFilters));
            const { container } = render(<Wrapped {...props} {...customProps} />);

            expect(container.querySelectorAll(".s-metric-filter-wrapper")).toHaveLength(1);
        });
    });

    describe("additional date filters", () => {
        // an attribute filter on the activity date dataset's "Month (Activity)" attribute
        const monthOfYearFilter: IDecoratedMetricAttributeFilter = {
            ...createDecoratedMetricAttributeFilter(),
            attribute: { dfRef: uriRef("/gdc/md/607") },
            original: { attribute: "activity.month.in.year", displayFormRef: uriRef("/gdc/md/607") },
            selectedElements: [],
        };
        const bucketItem = createBucketItem([
            createDecoratedDateFilter({}, null),
            createFilter("foo"),
            monthOfYearFilter,
        ]);

        const withDateDatasetsMeta = (state: IAppState) =>
            seedDateDatasetsMeta(state, { items: dateDatasetsMetaItems });

        it("lists it among the attribute filters while the improved metric date filter is off", () => {
            const Wrapped = withIntl(withRedux(MeasureFilters, withDateDatasetsMeta));
            const { container } = render(<Wrapped {...defaultProps} bucketItem={bucketItem} />);

            expect(container.querySelectorAll(".s-filter-button")).toHaveLength(2);
        });

        const WrappedWithImprovedDateFilter = withIntl(
            withRedux(MeasureFilters, (state) =>
                withRoot(withDateDatasetsMeta(state), {
                    featureFlags: { enableImprovedMetricDateFilter: true },
                }),
            ),
        );

        afterEach(() => {
            capabilityMocks.areGenericDateAttributeElementsSupported = true;
        });

        it("leaves it to the date filter picker when the improved metric date filter is on", () => {
            const { container } = render(
                <WrappedWithImprovedDateFilter {...defaultProps} bucketItem={bucketItem} />,
            );

            expect(container.querySelectorAll(".s-filter-button")).toHaveLength(1);
        });

        it("keeps listing it when the backend cannot serve date attribute elements", () => {
            capabilityMocks.areGenericDateAttributeElementsSupported = false;

            const { container } = render(
                <WrappedWithImprovedDateFilter {...defaultProps} bucketItem={bucketItem} />,
            );

            expect(container.querySelectorAll(".s-filter-button")).toHaveLength(2);
        });
    });

    describe("several date filters", () => {
        const withTwoDateFilters = createBucketItem([
            createDecoratedDateFilter(
                { attribute: "date", dimension: closedDateDataset.identifier } as never,
                null,
            ),
            createDecoratedDateFilter(
                { attribute: "date", dimension: closedDateDataset.identifier } as never,
                null,
            ),
        ]);
        const renderWith = (prepareState: (state: IAppState) => IAppState) => {
            const Wrapped = withIntl(withRedux(MeasureFilters, prepareState));
            return render(<Wrapped {...defaultProps} bucketItem={withTwoDateFilters} />);
        };
        const withImprovedDateFilter = (state: IAppState) =>
            withRoot(state, { featureFlags: { enableImprovedMetricDateFilter: true } });

        afterEach(() => {
            capabilityMocks.selectSupportsMultipleDateFilters = true;
        });

        it("shows a chip per date filter, as the filter bar does", () => {
            const { container } = renderWith(withImprovedDateFilter);

            expect(container.querySelectorAll(".s-metric-date-filter-button")).toHaveLength(2);
        });

        it("still shows every stored date filter without the capability, offering no further one", () => {
            capabilityMocks.selectSupportsMultipleDateFilters = false;
            const { container } = renderWith(withImprovedDateFilter);

            expect(container.querySelectorAll(".s-metric-date-filter-button")).toHaveLength(2);
            fireEvent.click(container.querySelector(".s-metric-add-filter-button"));
            const dateItem = document.querySelector(
                ".s-metric-add-filter-dropdown .s-add-filter-menu-item-date",
            );
            expect(dateItem.getAttribute("aria-disabled")).toBe("true");
            // and says why
            expect(dateItem.closest(".adi-add-filter-menu-item__tooltip-anchor")).not.toBeNull();
        });

        it("shows the first date filter only while the improved metric date filter is off", () => {
            // the open-report operation keeps only that one in the store anyway
            const { container } = renderWith((state) => state);

            expect(container.querySelectorAll(".s-metric-date-filter-button")).toHaveLength(1);
        });
    });

    describe("Add filter menu", () => {
        const withImprovedDateFilter = (state: IAppState) =>
            withRoot(state, { featureFlags: { enableImprovedMetricDateFilter: true } });
        const renderWith = (bucketItem: ReturnType<typeof createBucketItem>) => {
            const Wrapped = withIntl(withRedux(MeasureFilters, withImprovedDateFilter));
            return render(<Wrapped {...defaultProps} bucketItem={bucketItem} />);
        };
        const openMenu = (container: HTMLElement) => {
            fireEvent.click(container.querySelector(".s-metric-add-filter-button"));
            return document.querySelector(".s-metric-add-filter-dropdown");
        };
        const dateItem = () =>
            document.querySelector<HTMLButtonElement>(
                ".s-metric-add-filter-dropdown .s-add-filter-menu-item-date",
            );
        const attributeItem = () =>
            document.querySelector<HTMLButtonElement>(
                ".s-metric-add-filter-dropdown .s-add-filter-menu-item-attribute",
            );

        beforeEach(() => {
            vi.spyOn(API, "loadAvailableMeasureAttributes").mockResolvedValue([]);
        });

        afterEach(() => {
            vi.restoreAllMocks();
            capabilityMocks.selectSupportsMultipleDateFilters = true;
        });

        it("replaces the Filter by date chip and the Add attribute filter button with the flag on", () => {
            const { container } = renderWith(createBucketItem());

            expect(container.querySelector(".s-metric-date-filter-button")).toBeNull();
            expect(container.querySelector(".s-metric-attribute-filter-button")).toBeNull();
            expect(container.querySelector(".s-metric-add-filter-button")).not.toBeNull();
        });

        it("offers a date filter and the attribute values, the way the filter bar's menu does", () => {
            const { container } = renderWith(createBucketItem());

            expect(openMenu(container)).not.toBeNull();
            expect(dateItem()).not.toBeNull();
            expect(dateItem().getAttribute("aria-disabled")).toBeNull();
            expect(attributeItem()).not.toBeNull();
            expect(document.querySelector(".s-add-filter-menu-item-metric")).toBeNull();
        });

        it("mounts a date filter chip with its picker open when Date is picked", () => {
            const { container } = renderWith(createBucketItem());

            openMenu(container);
            fireEvent.click(dateItem());

            expect(document.querySelector(".s-metric-add-filter-dropdown")).toBeNull();
            expect(container.querySelectorAll(".s-metric-date-filter-button")).toHaveLength(1);
            expect(container.querySelector(".s-metric-date-filter-button")).toHaveClass("is-active");
            expect(document.querySelector(".s-filter-picker")).not.toBeNull();
        });

        it("offers one more date filter next to an existing one only with the capability", () => {
            const withDateFilter = createBucketItem([
                createDecoratedDateFilter(
                    { attribute: "date", dimension: closedDateDataset.identifier } as never,
                    null,
                ),
            ]);
            const { container, unmount } = renderWith(withDateFilter);
            openMenu(container);
            expect(dateItem().getAttribute("aria-disabled")).toBeNull();
            unmount();
            document.body.innerHTML = "";

            capabilityMocks.selectSupportsMultipleDateFilters = false;
            const { container: withoutCapability } = renderWith(withDateFilter);
            openMenu(withoutCapability);
            expect(dateItem().getAttribute("aria-disabled")).toBe("true");
        });

        // the list is loaded for the metric's MD object, so the item has to convert as a measure
        const measureItem = newDecoratedBucketItem({
            original: bucketItemOriginal,
            localIdentifier: bucketItemOriginal.localIdentifier,
            aggregation: "sum",
            isMeasure: true,
            attribute: { ref: uriRef("/bucket/item/measure"), uri: "/bucket/item/measure" },
            filters: [],
        });

        const catalogAttribute = (id: string, title: string): ICatalogAttribute => {
            const displayForm: IAttributeDisplayFormMetadataObject = {
                type: "displayForm",
                ref: { identifier: `${id}.df` },
                attribute: { identifier: id },
                id: `${id}.df`,
                description: "",
                title: "",
                uri: `${id}.df`,
                production: true,
                deprecated: false,
                unlisted: false,
                isDefault: true,
                isPrimary: true,
            };
            return {
                type: "attribute",
                defaultDisplayForm: displayForm,
                displayForms: [displayForm],
                geoPinDisplayForms: [],
                groups: [],
                attribute: {
                    type: "attribute",
                    id,
                    ref: { identifier: id },
                    uri: id,
                    title,
                    description: "",
                    production: true,
                    deprecated: false,
                    unlisted: false,
                    displayForms: [displayForm],
                },
            };
        };

        const openAttributePicker = async (container: HTMLElement) => {
            openMenu(container);
            fireEvent.click(attributeItem());
            await waitFor(() => {
                expect(document.querySelector("[data-testid='s-catalog-item-picker-list']")).not.toBeNull();
            });
        };

        it("turns the dropdown into the filter bar's attribute picker when Attribute values is picked", async () => {
            const { container } = renderWith(measureItem);

            openMenu(container);
            fireEvent.click(attributeItem());

            expect(document.querySelector(".s-metric-add-filter-dropdown")).not.toBeNull();
            expect(dateItem()).toBeNull();
            expect(document.querySelector("[data-testid='s-catalog-item-picker']")).not.toBeNull();
            await waitFor(() => {
                expect(document.querySelector("[data-testid='s-catalog-item-picker-search']")).not.toBeNull();
            });
            // the attributes valid for the metric are the picker's input
            expect(API.loadAvailableMeasureAttributes).toHaveBeenCalledTimes(1);
        });

        it("adds the picked attributes to the metric as one gesture", async () => {
            vi.mocked(API.loadAvailableMeasureAttributes).mockResolvedValue([
                catalogAttribute("region", "Region"),
                catalogAttribute("product", "Product"),
            ]);
            const { container } = renderWith(measureItem);
            await openAttributePicker(container);

            const items = document.querySelectorAll(".gd-ui-kit-catalog-item-picker__item");
            expect(items).toHaveLength(2);
            fireEvent.click(items[0]);
            fireEvent.click(items[1]);
            fireEvent.click(document.querySelector("[data-testid='s-catalog-item-picker-add']"));

            expect(dispatchMock).toHaveBeenCalledTimes(1);
            const action = dispatchMock.mock.calls[0][0];
            expect(action.type).toBe(setBucketItemAddMetricFilters.type);
            expect(
                action.payload.attributes.map((attribute: { identifier: string }) => attribute.identifier),
            ).toEqual(["region", "product"]);
            expect(document.querySelector(".s-metric-add-filter-dropdown")).toBeNull();
        });

        it("caps the picked attributes at the room left under the attribute filter maximum", async () => {
            vi.mocked(API.loadAvailableMeasureAttributes).mockResolvedValue([
                catalogAttribute("region", "Region"),
                catalogAttribute("product", "Product"),
            ]);
            // 19 attribute filters already: one more fits
            const nearlyFull = newDecoratedBucketItem({
                ...measureItem,
                filters: range(19).map((i) => ({
                    ...createFilter(`foo${i}`),
                    attribute: { dfRef: uriRef(`foo${i}.df`), identifier: `foo${i}`, type: "attribute" },
                })),
            });
            const { container } = renderWith(nearlyFull);
            await openAttributePicker(container);

            const items = document.querySelectorAll(".gd-ui-kit-catalog-item-picker__item");
            fireEvent.click(items[0]);
            fireEvent.click(items[1]);
            fireEvent.click(document.querySelector("[data-testid='s-catalog-item-picker-add']"));

            const action = dispatchMock.mock.calls[0][0];
            expect(action.payload.attributes).toHaveLength(1);
            // and the user is told about the pick left out
            expect(dispatchMock).toHaveBeenCalledTimes(2);
            expect(dispatchMock.mock.calls[1][0].type).toBe(addMessage.type);
            expect(dispatchMock.mock.calls[1][0].payload).toMatchObject({
                translationKey: "dashboard.bucket.add_filter.attribute_limit_reached",
                values: { added: "1", picked: "2", max: "20" },
            });
        });

        it("leaves out the attributes the metric already filters by", async () => {
            vi.mocked(API.loadAvailableMeasureAttributes).mockResolvedValue([
                catalogAttribute("region", "Region"),
                catalogAttribute("product", "Product"),
            ]);
            const filtered = newDecoratedBucketItem({
                ...measureItem,
                filters: [
                    {
                        ...createFilter("region"),
                        attribute: { dfRef: uriRef("region.df"), identifier: "region", type: "attribute" },
                    },
                ],
            });
            const { container } = renderWith(filtered);
            await openAttributePicker(container);

            const items = document.querySelectorAll(".gd-ui-kit-catalog-item-picker__item");
            expect(items).toHaveLength(1);
            expect(items[0].textContent).toContain("Product");
        });

        it("disables the attribute values once the metric has the maximum of attribute filters", () => {
            const { container } = renderWith(createBucketItem(range(20).map((i) => createFilter(`foo${i}`))));

            openMenu(container);

            expect(attributeItem().getAttribute("aria-disabled")).toBe("true");
            expect(attributeItem().closest(".adi-add-filter-menu-item__tooltip-anchor")).not.toBeNull();
        });
    });

    describe("AttributeFilter", () => {
        const bucketItem = createBucketItem([createFilter("foo")]);

        it("renders single filter button if there is single filter in bucket item", () => {
            const { container } = renderComponent({ bucketItem });
            expect(container.querySelectorAll(".s-filter-button")).toHaveLength(1);
        });

        it("renders two filter buttons if there are two filters in bucket item", () => {
            const bucketItemWithTwoFilters = createBucketItem([createFilter("foo"), createFilter("foo2")]);

            const { container } = renderComponent({
                bucketItem: bucketItemWithTwoFilters,
            });
            expect(container.querySelectorAll(".s-filter-button")).toHaveLength(2);
        });

        it("removes filter on remove button click", () => {
            const { container } = renderComponent({ bucketItem });

            fireEvent.click(container.querySelector("button.s-remove-attribute-filter"));

            expect(dispatchMock).toHaveBeenCalledWith(
                setBucketItemRemoveMetricFilter(bucketItemOriginal, filterOriginal),
            );
        });
    });

    describe("MeasureAttributeFilter", () => {
        const testCases = [
            {
                name: "renders add button if no filter present",
                numOfAttrFilters: 0,
                hasDateFilter: false,
                expectAddButton: true,
            },
            {
                name: "renders add button if less than maximum filters present",
                numOfAttrFilters: 19,
                hasDateFilter: false,
                expectAddButton: true,
            },
            {
                name: "renders add button if less than maximum filters present - does not count date filter",
                numOfAttrFilters: 19,
                hasDateFilter: true,
                expectAddButton: true,
            },
            {
                name: "does not render add button if maximum filters present",
                numOfAttrFilters: 20,
                hasDateFilter: false,
                expectAddButton: false,
            },
        ];

        function getTestCaseFilters(testCase: { numOfAttrFilters: number; hasDateFilter: boolean }) {
            const filters: IDecoratedMetricFilters = range(testCase.numOfAttrFilters).map((_val, index) => {
                return createFilter("foo" + index);
            });
            if (testCase.hasDateFilter) {
                const decoratedDateFilter = createDecoratedDateFilter({}, null);
                filters.push(decoratedDateFilter);
            }
            return filters;
        }

        testCases.forEach((testCase) => {
            it(`${testCase.name}`, () => {
                const bucketItemWithFilters = createBucketItem(getTestCaseFilters(testCase));

                const { container } = renderComponent({
                    bucketItem: bucketItemWithFilters,
                });

                const addButtonPresent = !!container.querySelector(
                    ".s-measures-bucket-id.s-metric-attribute-filter-button",
                );

                expect(addButtonPresent).toEqual(testCase.expectAddButton);
            });
        });
    });
});
