// (C) 2019-2022 GoodData Corporation
import { expectType } from "tsd";
import {
    IFilter,
    IAttributeFilter,
    IAbsoluteDateFilter,
    IMeasureFilter,
    IDateFilter,
    IMeasureValueFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    IRankingFilter,
    INullableFilter,
    IMeasure,
    IMeasureDefinition,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IAttribute,
    ISortItem,
    IAttributeSortItem,
    IMeasureSortItem,
    ITotal,
} from "@gooddata/sdk-model";
import { newPlaceholder, newComposedPlaceholder } from "../factory";
import {
    AttributeFilterOrPlaceholder,
    AttributeFiltersOrPlaceholders,
    AttributeMeasureOrPlaceholder,
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
    AttributesOrPlaceholders,
    FilterOrPlaceholder,
    FiltersOrPlaceholders,
    MeasureOrPlaceholder,
    MeasuresOrPlaceholders,
    NullableFilterOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    TotalsOrPlaceholders,
} from "../aliases";

describe("Check assignability of filters and its placeholders to relevant aliases", () => {
    const nullableFilter: INullableFilter = null as any;
    const filter: IFilter = null as any;
    const dateFilter: IDateFilter = null as any;
    const measureFilter: IMeasureFilter = null as any;
    const attributeFilter: IAttributeFilter = null as any;
    const absoluteDateFilter: IAbsoluteDateFilter = null as any;
    const relativeDateFilter: IRelativeDateFilter = null as any;
    const positiveAttributeFilter: IPositiveAttributeFilter = null as any;
    const negativeAttributeFilter: INegativeAttributeFilter = null as any;
    const measureValueFilter: IMeasureValueFilter = null as any;
    const rankingFilter: IRankingFilter = null as any;

    const filters = [
        filter,
        dateFilter,
        measureFilter,
        attributeFilter,
        absoluteDateFilter,
        relativeDateFilter,
        positiveAttributeFilter,
        negativeAttributeFilter,
        measureValueFilter,
        rankingFilter,
    ];
    const nullableFilters = [...filters, null, nullableFilter];
    const attributeFilters = [attributeFilter, positiveAttributeFilter, negativeAttributeFilter];

    it("all filter and placeholder combinations should be assignable to FiltersOrPlaceholders / FilterOrPlaceholder", () => {
        const placeholders = filters.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...filters, ...placeholders];

        expectType<FiltersOrPlaceholders>(valuesOrPlaceholders);
        expectType<FiltersOrPlaceholders>([composedPlaceholder]);

        // This should be assignable as well
        expectType<NullableFiltersOrPlaceholders>(valuesOrPlaceholders);
        expectType<NullableFiltersOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<FilterOrPlaceholder>(v);
        });
    });

    it("all nullable filter and placeholder combinations should be assignable to NullableFiltersOrPlaceholders / NullableFilterOrPlaceholder", () => {
        const placeholders = nullableFilters.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...nullableFilters, ...placeholders];

        // This should be assignable as well
        expectType<NullableFiltersOrPlaceholders>(valuesOrPlaceholders);
        expectType<NullableFiltersOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<NullableFilterOrPlaceholder>(v);
        });
    });

    it("all attribute filter and placeholder combinations should be assignable to AttributeFiltersOrPlaceholders / AttributeFilterOrPlaceholder", () => {
        const placeholders = attributeFilters.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...attributeFilters, ...placeholders];

        expectType<AttributeFiltersOrPlaceholders>(valuesOrPlaceholders);
        expectType<AttributeFiltersOrPlaceholders>([composedPlaceholder]);

        // This should be assignable as well
        expectType<NullableFiltersOrPlaceholders>(valuesOrPlaceholders);
        expectType<NullableFiltersOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<AttributeFilterOrPlaceholder>(v);
        });
    });
});

describe("Check assignability of attributes, measures and its placeholders to relevant aliases", () => {
    const attribute: IAttribute = null as any;
    const measure: IMeasure = null as any;
    const simpleMeasure: IMeasure<IMeasureDefinition> = null as any;
    const arithmeticMeasure: IMeasure<IArithmeticMeasureDefinition> = null as any;
    const popMeasure: IMeasure<IPoPMeasureDefinition> = null as any;
    const previousPeriodMeasure: IMeasure<IPreviousPeriodMeasureDefinition> = null as any;

    const attributes = [attribute];
    const measures = [measure, simpleMeasure, arithmeticMeasure, popMeasure, previousPeriodMeasure];
    const attributesOrMeasures = [...attributes, ...measures];

    it("all attribute and placeholder combinations should be assignable to AttributesOrPlaceholders / AttributeOrPlaceholder", () => {
        const placeholders = attributes.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...attributes, ...placeholders];

        expectType<AttributesOrPlaceholders>(valuesOrPlaceholders);
        expectType<AttributesOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<AttributeOrPlaceholder>(v);
        });
    });

    it("all measure and placeholder combinations should be assignable to MeasuresOrPlaceholders / MeasureOrPlaceholder", () => {
        const placeholders = measures.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...measures, ...placeholders];

        expectType<MeasuresOrPlaceholders>(valuesOrPlaceholders);
        expectType<MeasuresOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<MeasureOrPlaceholder>(v);
        });
    });

    it("all attribute, measure and placeholder combinations should be assignable to AttributesMeasuresOrPlaceholders / AttributeMeasureOrPlaceholder", () => {
        const placeholders = attributesOrMeasures.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...attributesOrMeasures, ...placeholders];

        expectType<AttributesMeasuresOrPlaceholders>(valuesOrPlaceholders);
        expectType<AttributesMeasuresOrPlaceholders>([composedPlaceholder]);

        valuesOrPlaceholders.forEach((v) => {
            expectType<AttributeMeasureOrPlaceholder>(v);
        });
    });
});

describe("Check assignability of sorts and its placeholders to relevant aliases", () => {
    const sort: ISortItem = null as any;
    const attributeSort: IAttributeSortItem = null as any;
    const measureSort: IMeasureSortItem = null as any;

    const sorts = [sort, attributeSort, measureSort];

    it("all sort and placeholder combinations should be assignable to SortsOrPlaceholders", () => {
        const placeholders = sorts.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...sorts, ...placeholders];

        expectType<SortsOrPlaceholders>(valuesOrPlaceholders);
        expectType<SortsOrPlaceholders>([composedPlaceholder]);
    });
});

describe("Check assignability of totals and its placeholders to relevant aliases", () => {
    const total: ITotal = null as any;

    const totals = [total];

    it("all total and placeholder combinations should be assignable to TotalsOrPlaceholders", () => {
        const placeholders = totals.map((f) => newPlaceholder(f));
        const composedPlaceholder = newComposedPlaceholder(placeholders);
        const valuesOrPlaceholders = [...totals, ...placeholders];

        expectType<TotalsOrPlaceholders>(valuesOrPlaceholders);
        expectType<TotalsOrPlaceholders>([composedPlaceholder]);
    });
});
