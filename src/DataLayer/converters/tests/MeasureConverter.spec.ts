// (C) 2007-2018 GoodData Corporation
import * as measures from './fixtures/MeasureConverter.visObj.fixtures';
import * as afm from './fixtures/MeasureConverter.afm.fixtures';
import MeasureConverter from '../MeasureConverter';

describe('convertMeasure', () => {
    it('should convert simple measures', () => {
        expect(MeasureConverter.convertMeasure(measures.simpleMeasure)).toEqual({
            ...afm.simpleMeasure
        });
    });

    it('should convert simple measures with identifiers', () => {
        expect(MeasureConverter.convertMeasure(measures.simpleMeasureWithIdentifiers)).toEqual({
            ...afm.simpleMeasureWithIdentifiers
        });
    });

    it('should ignore format defined on simple measures', () => {
        expect(MeasureConverter.convertMeasure(measures.simpleMeasureWithFormat)).toEqual({
            ...afm.simpleMeasure
        });
    });

    it('should convert simple renamed measures', () => {
        expect(MeasureConverter.convertMeasure(measures.renamedMeasure)).toEqual({
            ...afm.renamedMeasure
        });
    });

    it('should convert filtered measures', () => {
        expect(MeasureConverter.convertMeasure(measures.filteredMeasure)).toEqual({
            ...afm.filteredMeasure
        });
    });

    it('should convert relative date filtered measures', () => {
        expect(MeasureConverter.convertMeasure(measures.measureWithRelativeDate)).toEqual({
            ...afm.measureWithRelativeDate
        });
    });

    it('should convert absolute date filtered measures', () => {
        expect(MeasureConverter.convertMeasure(measures.measureWithAbsoluteDate)).toEqual({
            ...afm.measureWithAbsoluteDate
        });
    });

    it('should convert fact based measures', () => {
        expect(MeasureConverter.convertMeasure(measures.factBasedMeasure)).toEqual({
            ...afm.factBasedMeasure
        });
    });

    it('should convert fact based renamed measures', () => {
        expect(MeasureConverter.convertMeasure(measures.factBasedRenamedMeasure)).toEqual({
            ...afm.factBasedRenamedMeasure
        });
    });

    it('should convert attribute based measures', () => {
        expect(MeasureConverter.convertMeasure(measures.attributeBasedMeasure)).toEqual({
            ...afm.attributeBasedMeasure
        });
    });

    it('should convert attribute based measures without format', () => {
        expect(MeasureConverter.convertMeasure(measures.attributeBasedMeasureWithoutFormat)).toEqual({
            ...afm.attributeBasedMeasure
        });
    });

    it('should convert attribute based renamed measures', () => {
        expect(MeasureConverter.convertMeasure(measures.attributeBasedRenamedMeasure)).toEqual({
            ...afm.attributeBasedRenamedMeasure
        });
    });

    it('should convert measure with show in percent', () => {
        expect(MeasureConverter.convertMeasure(measures.showInPercent)).toEqual({
            ...afm.showInPercent
        });
    });

    it('should convert measure with show in percent without format', () => {
        expect(MeasureConverter.convertMeasure(measures.showInPercentWithoutFormat)).toEqual({
            ...afm.showInPercent
        });
    });

    it('should convert pop measure', () => {
        expect(MeasureConverter.convertMeasure(measures.popMeasure)).toEqual({
            ...afm.popMeasure
        });
    });

    it('should convert previous period measure', () => {
        expect(MeasureConverter.convertMeasure(measures.previousPeriodMeasure)).toEqual({
            ...afm.previousPeriodMeasure
        });
    });
});
