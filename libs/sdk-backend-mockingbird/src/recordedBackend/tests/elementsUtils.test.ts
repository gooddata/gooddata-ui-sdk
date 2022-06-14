// (C) 2022 GoodData Corporation
import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    newMeasure,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";
import {
    newAttributeFilterLimitingItem,
    newDateFilterLimitingItem,
    newMeasureLimitingItem,
    resolveLimitingItems,
} from "../elementsUtils";
import { AttributeElementsFiltering } from "../types";

describe("resolveLimitingItems", () => {
    const elements: IAttributeElement[] =
        ReferenceRecordings.Recordings.metadata.displayForms.df_label_product_id_name.elements;
    const attributeFilter = newPositiveAttributeFilter(ReferenceMd.Account.Name, ["foo"]);
    const attributeFilterLink: IElementsQueryAttributeFilter = {
        attributeFilter,
        overAttribute: ReferenceMd.ForecastCategory.attribute.displayForm,
    };
    const dateFilter = newRelativeDateFilter(ReferenceMd.DateDatasets.Timeline, "GDC.time.date", -42, 0);
    const measure = ReferenceMd.Amount;

    it("should throw if a uriRef is used", () => {
        expect(() =>
            resolveLimitingItems(
                { measures: { "some-uri": () => true } },
                [],
                [],
                [newMeasure(uriRef("some-uri"))],
            )(elements),
        ).toThrow();
    });

    it("should not touch elements if no filtering config is provided", () => {
        const actual = resolveLimitingItems(
            undefined,
            [attributeFilterLink],
            [dateFilter],
            [measure],
        )(elements);
        expect(actual).toBe(elements);
    });

    it("should not touch elements if no limiting items are provided", () => {
        const actual = resolveLimitingItems(
            {
                attributeFilters: {
                    ...newAttributeFilterLimitingItem(attributeFilter, (_, idx) => idx === 0),
                },
            },
            [],
            [],
            [],
        )(elements);
        expect(actual).toBe(elements);
    });

    type Scenario = [name: string, config: AttributeElementsFiltering];
    const Scenarios: Scenario[] = [
        [
            "attribute filter",
            {
                attributeFilters: {
                    ...newAttributeFilterLimitingItem(attributeFilter, (_, idx) => idx === 0),
                },
            },
        ],
        [
            "date filter",
            {
                dateFilters: {
                    ...newDateFilterLimitingItem(dateFilter, (_, idx) => idx === 0),
                },
            },
        ],
        [
            "measure",
            {
                measures: {
                    ...newMeasureLimitingItem(measure, (_, idx) => idx === 0),
                },
            },
        ],
        [
            "combined filtering",
            {
                attributeFilters: {
                    ...newAttributeFilterLimitingItem(attributeFilter, (_, idx) => idx < 3),
                },
                dateFilters: {
                    ...newDateFilterLimitingItem(dateFilter, (_, idx) => idx !== 1),
                },
                measures: {
                    ...newMeasureLimitingItem(measure, (_, idx) => idx !== 2),
                },
            },
        ],
    ];

    it.each(Scenarios)("should filter elements according to %s", (_, config) => {
        const actual = resolveLimitingItems(config, [attributeFilterLink], [dateFilter], [measure])(elements);
        expect(actual).toEqual([elements[0]]);
    });
});
