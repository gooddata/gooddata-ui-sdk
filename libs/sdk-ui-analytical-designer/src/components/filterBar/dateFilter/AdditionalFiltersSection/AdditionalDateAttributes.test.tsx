// (C) 2021-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import { type IAttributeFilter } from "../../../../store/filter_bar/filter_bar_types.js";
import {
    type IDateDatasetRefWithGranularities,
    type IGranularityOptionWithRefs,
} from "../../../../typings/datasets.js";
import { withIntl } from "../../../../utils/with_intl.js";
import { withRedux } from "../../../../utils/with_redux.js";

import {
    AdditionalDateAttributes,
    type IAdditionalDateAttributesProps,
    getAvailableGranularityOptions,
} from "./AdditionalDateAttributes.js";
import { AdditionalDateAttributesFragment } from "./fragments/AdditionalDateAttributes.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../AttributeFilter/AttributeFilter", () => {
    return {
        AttributeFilter: vi.fn(() => <div className="s-filter-button" />),
    };
});

const attributeGranularities: IGranularityOptionWithRefs[] = [
    {
        ref: uriRef("/gdc/md/679"),
        dfRef: uriRef("/gdc/md/680"),
        cacheIdentifier: "activity.day.in.week",
        dateType: "GDC.time.day_in_week",
        label: "day_in_week",
        valuesPreview: "day_in_week_preview",
        chronologicalGranularity: "GDC.time.date",
    },
    {
        ref: uriRef("/gdc/md/642"),
        dfRef: uriRef("/gdc/md/643"),
        cacheIdentifier: "activity.day.in.month",
        dateType: "GDC.time.day_in_month",
        label: "day_in_month",
        valuesPreview: "day_in_month_preview",
        chronologicalGranularity: "GDC.time.date",
    },
    {
        ref: uriRef("/gdc/md/696"),
        dfRef: uriRef("/gdc/md/697"),
        cacheIdentifier: "activity.day.in.quarter",
        dateType: "GDC.time.day_in_quarter",
        label: "day_in_quarter",
        valuesPreview: "day_in_quarter_preview",
        chronologicalGranularity: "GDC.time.date",
    },
];

const selectedDateDataset: IDecoratedDateDataset = {
    identifier: "id1",
    ref: idRef("d1"),
    title: "My date dataset",
};

const dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[] = [
    {
        ref: idRef("d1"),
        attributes: attributeGranularities,
    },
    {
        ref: idRef("d2"),
        attributes: attributeGranularities.slice(0, 1),
    },
];

const singleAdditionalDateAttribute: IAttributeFilter[] = [
    {
        localIdentifier: "activity-day-in-week-identifier",
        type: "attribute",
        cacheItemIdentifier: "activity.day.in.week",
        displayFormRef: uriRef("/gdc/md/680"),
        filterConfig: {
            selectedElements: [],
            totalElementsCount: 0,
            isInverted: true,
        },
    },
];

const multipleAdditionalDateAttributes: IAttributeFilter[] = [
    {
        localIdentifier: "activity-day-in-week-identifier",
        type: "attribute",
        cacheItemIdentifier: "activity.day.in.week",
        displayFormRef: uriRef("/gdc/md/680"),
        filterConfig: {
            selectedElements: [],
            totalElementsCount: 0,
            isInverted: true,
        },
    },
    {
        localIdentifier: "activity-day-in-month-identifier",
        type: "attribute",
        cacheItemIdentifier: "activity.day.in.month",
        displayFormRef: uriRef("/gdc/md/643"),
        filterConfig: {
            selectedElements: [],
            totalElementsCount: 0,
            isInverted: true,
        },
    },
];

const renderComponent = (props?: Partial<IAdditionalDateAttributesProps>) => {
    const defaultProps: IAdditionalDateAttributesProps = {
        selectedDateDataset,
        dateDatasetRefsWithGranularities,
        additionalDateAttributeFilters: singleAdditionalDateAttribute,
        onApply: () => {},
        onClose: () => {},
        onSelect: () => {},
        onRemove: () => {},
        migratedAdditionalFilters: [],
        autoOpenedFilters: [],
        onEmptyDateValuesFilterModeChange: () => {},
        onEmptyDateValuesFilterAdd: () => {},
        onEmptyDateValuesFilterRemove: () => {},
        isEmptyDateValuesFilterOpenOnInit: false,
    };

    const Wrapped = withIntl(withRedux(AdditionalDateAttributes));
    const { container } = render(<Wrapped {...defaultProps} {...props} />);
    return new AdditionalDateAttributesFragment(container);
};

describe("AdditionalDateAttributes", () => {
    describe("getAvailableGranularityOptions", () => {
        it("should filter out selected additional date attributes and return only available granularity options", () => {
            const result = getAvailableGranularityOptions(
                multipleAdditionalDateAttributes,
                attributeGranularities,
            );

            expect(result).toEqual([
                {
                    dateType: "GDC.time.day_in_quarter",
                    label: "day_in_quarter",
                    valuesPreview: "day_in_quarter_preview",
                    chronologicalGranularity: "GDC.time.date",
                },
            ]);
        });

        it("should not offer second of day granularity", () => {
            const secondInDayGranularity: IGranularityOptionWithRefs = {
                ref: uriRef("/gdc/md/700"),
                dfRef: uriRef("/gdc/md/701"),
                cacheIdentifier: "activity.second.in.day",
                dateType: "GDC.time.second_in_day",
                label: "second_in_day",
                valuesPreview: "second_in_day_preview",
                chronologicalGranularity: "GDC.time.second",
            };

            const result = getAvailableGranularityOptions(
                [],
                [...attributeGranularities, secondInDayGranularity],
            );

            expect(result.map(({ dateType }) => dateType)).toEqual([
                "GDC.time.day_in_week",
                "GDC.time.day_in_month",
                "GDC.time.day_in_quarter",
            ]);
        });
    });

    describe("additional date attribute", () => {
        it("should render passed additional date attributes with remove buttons", () => {
            const component = renderComponent({
                additionalDateAttributeFilters: multipleAdditionalDateAttributes,
            });

            expect(component.getAdditionalDateFilters()).toHaveLength(2);
            expect(component.getAdditionalDateFilter("day_in_week")).toBeTruthy();
            expect(component.getAdditionalDateFilterRemoveButton("day_in_week")).toBeTruthy();
            expect(component.getAdditionalDateFilter("day_in_month")).toBeTruthy();
            expect(component.getAdditionalDateFilterRemoveButton("day_in_month")).toBeTruthy();
        });

        it("should call onRemove on additional date attribute remove button click", () => {
            const onRemove = vi.fn();
            const component = renderComponent({ onRemove });

            component.removeAdditionalDateFilter("day_in_week");

            expect(onRemove).toHaveBeenCalled();
        });
    });

    describe("granularities dropdown", () => {
        it("should render granularities dropdown button", () => {
            const component = renderComponent();

            expect(component.getGranularitiesDropdownButton()).toBeTruthy();
        });

        it("should not render granularities dropdown button when all available granularity options are already selected", () => {
            const component = renderComponent({
                selectedDateDataset: {
                    identifier: "id2",
                    ref: idRef("d2"),
                    title: "My other date dataset",
                },
                emptyDateValuesFilterMode: "exclude",
            });

            expect(component.getGranularitiesDropdownButton()).toBeFalsy();
        });

        it("should toggle granularities dropdown on button click", () => {
            const component = renderComponent();

            expect(component.getGranularitiesDropdown()).toBeFalsy();
            component.clickOnGranularitiesDropdownButton();
            expect(component.getGranularitiesDropdown()).toBeTruthy();
            component.clickOnGranularitiesDropdownButton();
            expect(component.getGranularitiesDropdown()).toBeFalsy();
        });

        it("should render all available granularity options in granularity dropdown except the selected ones", () => {
            const component = renderComponent();

            component.clickOnGranularitiesDropdownButton();

            expect(component.getGranularityOptions()).toHaveLength(2);
            expect(component.getGranularityOption("day_in_week")).toBeFalsy();
            expect(component.getGranularityOption("day_in_month")).toBeTruthy();
            expect(component.getGranularityOption("day_in_quarter")).toBeTruthy();
        });

        it("should call onSelect on granularity option select", () => {
            const onSelect = vi.fn();
            const component = renderComponent({ onSelect });

            component.selectGranularity("day_in_month");

            expect(onSelect).toHaveBeenCalled();
        });
    });

    describe("warning panel", () => {
        it("should not render warning panel when no filter was migrated", () => {
            const component = renderComponent();
            expect(component.getWarningPanel()).toEqual("none");
        });

        it("should render warning panel when one filter was migrated", () => {
            const component = renderComponent({ migratedAdditionalFilters: ["id"] });
            expect(component.getWarningPanel()).toEqual("single");
        });

        it("should render warning panel when multiple filters were migrated", () => {
            const component = renderComponent({ migratedAdditionalFilters: ["id1", "id2"] });
            expect(component.getWarningPanel()).toEqual("multiple");
        });
    });

    describe("empty date values filter", () => {
        it("should render EmptyValuesFilter when emptyDateValuesFilterMode is provided", () => {
            const component = renderComponent({ emptyDateValuesFilterMode: "include" });

            expect(component.getEmptyValuesFilter()).toBeTruthy();
        });

        it("should not render EmptyValuesFilter when emptyDateValuesFilterMode is undefined", () => {
            const component = renderComponent({ emptyDateValuesFilterMode: undefined });

            expect(component.getEmptyValuesFilter()).toBeFalsy();
        });

        it("should call onEmptyDateValuesFilterRemove when removing the filter", () => {
            const onEmptyDateValuesFilterRemove = vi.fn();
            const component = renderComponent({
                emptyDateValuesFilterMode: "include",
                onEmptyDateValuesFilterRemove,
            });

            component.removeEmptyValuesFilter();

            expect(onEmptyDateValuesFilterRemove).toHaveBeenCalled();
        });

        it("should show empty values filter option in dropdown when feature is enabled and filter is not already added", () => {
            const component = renderComponent({ emptyDateValuesFilterMode: undefined });

            component.clickOnGranularitiesDropdownButton();

            expect(component.getEmptyValuesFilterDropdownItem()).toBeTruthy();
        });

        it("should not show empty values filter option in dropdown when filter is already enabled", () => {
            const component = renderComponent({ emptyDateValuesFilterMode: "include" });

            component.clickOnGranularitiesDropdownButton();

            expect(component.getEmptyValuesFilterDropdownItem()).toBeFalsy();
        });

        it("should call onEmptyDateValuesFilterAdd when selecting the empty values filter from dropdown", () => {
            const onEmptyDateValuesFilterAdd = vi.fn();
            const component = renderComponent({
                emptyDateValuesFilterMode: undefined,
                onEmptyDateValuesFilterAdd,
            });

            component.addEmptyValuesFilter();

            expect(onEmptyDateValuesFilterAdd).toHaveBeenCalled();
        });

        it("should render with disabled class when isDisabled is true", () => {
            const component = renderComponent({
                isDisabled: true,
            });

            const container = component.container.querySelector(".adi-additional-date-attributes");
            expect(container?.classList.contains("is-disabled")).toBe(true);
        });

        it("should not render with disabled class when isDisabled is false", () => {
            const component = renderComponent({
                isDisabled: false,
            });

            const container = component.container.querySelector(".adi-additional-date-attributes");
            expect(container?.classList.contains("is-disabled")).toBe(false);
        });
    });
});
