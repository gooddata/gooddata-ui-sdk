// (C) 2007-2018 GoodData Corporation
import {
    simpleMeasure,
    simpleMeasureWithIdentifiers,
    renamedMeasure,
    filteredMeasure,
    measureWithAbsoluteDate,
    measureWithRelativeDate,
    popMeasure,
    popMeasureWithSorting,
    showInPercent,
    showInPercentWithDate,
    measureWithSorting,
    categoryWithSorting,
    factBasedMeasure,
    factBasedRenamedMeasure,
    attributeBasedMeasure,
    attributeBasedRenamedMeasure,
    stackingAttribute,
    stackingRenamedAttribute,
    attributeFilter,
    attributeFilterWithAll,
    dateFilter,
    dateFilterWithoutInterval,
    oneMeasureOneAttribute,
    oneMeasureOneAttributeWithIdentifiers,
    reducedMultipleSorts
} from './fixtures/Afm.fixtures';

import { charts, tables } from './fixtures/VisObj.fixtures';
import { toAfmResultSpec } from '../toAfmResultSpec';

describe('toAfmResultSpec', () => {
    it('should convert simple measures', () => {
        expect(toAfmResultSpec(charts.simpleMeasure)).toEqual({
            ...simpleMeasure
        });
    });

    it('should convert simple measures with identifiers', () => {
        expect(toAfmResultSpec(charts.simpleMeasureWithIdentifiers)).toEqual({
            ...simpleMeasureWithIdentifiers
        });
    });

    it('should ignore format defined on simple measures', () => {
        expect(toAfmResultSpec(charts.simpleMeasureWithFormat)).toEqual({
            ...simpleMeasure
        });
    });

    it('should convert simple renamed measures', () => {
        expect(toAfmResultSpec(charts.renamedMeasure)).toEqual({
            ...renamedMeasure
        });
    });

    it('should convert filtered measures', () => {
        expect(toAfmResultSpec(charts.filteredMeasure)).toEqual({
            ...filteredMeasure
        });
    });

    it('should convert relative date filtered measures', () => {
        expect(toAfmResultSpec(charts.measureWithRelativeDate)).toEqual({
            ...measureWithRelativeDate
        });
    });

    it('should convert absolute date filtered measures', () => {
        expect(toAfmResultSpec(charts.measureWithAbsoluteDate)).toEqual({
            ...measureWithAbsoluteDate
        });
    });

    it('should convert fact based measures', () => {
        expect(toAfmResultSpec(charts.factBasedMeasure)).toEqual({
            ...factBasedMeasure
        });
    });

    it('should convert fact based renamed measures', () => {
        expect(toAfmResultSpec(charts.factBasedRenamedMeasure)).toEqual({
            ...factBasedRenamedMeasure
        });
    });

    it('should convert attribute based measures', () => {
        expect(toAfmResultSpec(charts.attributeBasedMeasure)).toEqual({
            ...attributeBasedMeasure
        });
    });

    it('should convert attribute based measures and add its default format #,##0', () => {
        expect(toAfmResultSpec(charts.attributeBasedMeasureWithoutFormat)).toEqual({
            ...attributeBasedMeasure
        });
    });

    it('should convert attribute based renamed measures', () => {
        expect(toAfmResultSpec(charts.attributeBasedRenamedMeasure)).toEqual({
            ...attributeBasedRenamedMeasure
        });
    });

    it('should convert measure with show in percent with attribute', () => {
        expect(toAfmResultSpec(charts.showInPercent)).toEqual({
            ...showInPercent
        });
    });

    it('should convert measure with show in percent and add its default format #,##0.00%', () => {
        expect(toAfmResultSpec(charts.showInPercentWithoutFormat)).toEqual({
            ...showInPercent
        });
    });

    it('should convert measure with show in percent with date', () => {
        expect(toAfmResultSpec(charts.showInPercentWithDate)).toEqual({
            ...showInPercentWithDate
        });
    });

    it('should convert measure with sorting', () => {
        expect(toAfmResultSpec(charts.measureWithSorting)).toEqual({
            ...measureWithSorting
        });
    });

    it('should convert pop measure', () => {
        expect(toAfmResultSpec(charts.popMeasure)).toEqual({
            ...popMeasure
        });
    });

    it('should convert pop measure with sorting', () => {
        expect(toAfmResultSpec(charts.popMeasureWithSorting)).toEqual({
            ...popMeasureWithSorting
        });
    });

    it('should convert category with sorting', () => {
        expect(toAfmResultSpec(charts.categoryWithSorting)).toEqual({
            ...categoryWithSorting
        });
    });

    it('should convert attribute filter', () => {
        expect(toAfmResultSpec(charts.attributeFilter)).toEqual({
            ...attributeFilter
        });
    });

    it('should convert date filter', () => {
        expect(toAfmResultSpec(charts.dateFilter)).toEqual({
            ...dateFilter
        });
    });

    it('should convert date filter with from/to as strings', () => {
        expect(toAfmResultSpec(charts.dateFilterWithStrings)).toEqual({
            ...dateFilter
        });
    });

    it('should skip filter when date filter from/to is undefined for relative (alltime)', () => {
        expect(toAfmResultSpec(charts.dateFilterWithUndefs)).toEqual({
            ...dateFilterWithoutInterval
        });
    });

    it('should convert stacking renamed attribute', () => {
        expect(toAfmResultSpec(charts.stackingRenamedAttribute)).toEqual({
            ...stackingRenamedAttribute
        });
    });

    it('should skip attribute filter with ALL', () => {
        expect(toAfmResultSpec(charts.attributeFilterWithAll)).toEqual({
            ...attributeFilterWithAll
        });
    });

    it('should convert stacking attribute as normal attribute, conversion has no semantic for buckets', () => {
        expect(toAfmResultSpec(charts.stackingAttribute)).toEqual({
            ...stackingAttribute
        });
    });

    it('should convert table as generic chart, conversion has no semantic for buckets', () => {
        expect(toAfmResultSpec(tables.oneMeasureOneAttribute)).toEqual({
            ...oneMeasureOneAttribute
        });
    });

    it('should convert table with identifiers', () => {
        expect(toAfmResultSpec(tables.oneMeasureOneAttributeWithIdentifiers)).toEqual({
            ...oneMeasureOneAttributeWithIdentifiers
        });
    });

    it('should convert only one sort item', () => {
        expect(toAfmResultSpec(tables.multipleSorts)).toEqual({
            ...reducedMultipleSorts
        });
    });
});
