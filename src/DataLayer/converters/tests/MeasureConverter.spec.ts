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

    it('should convert simple measure with format', () => {
        expect(MeasureConverter.convertMeasure(measures.simpleMeasureWithFormat)).toEqual({
            ...afm.simpleMeasureWithFormat
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

    it('should convert arithmetic measure', () => {
        const arithmeticMeasure = measures.buildArithmeticMeasure(
            'arithmetic_measure_1', {}, 'Sum of m1 and m2'
        );
        expect(MeasureConverter.convertMeasure(arithmeticMeasure)).toEqual({
            ...afm.arithmeticMeasure
        });
    });

    it('should convert arithmetic without modification to the original object', () => {
        const arithmeticMeasure = measures.buildArithmeticMeasure(
            'arithmetic_measure_1', {}, 'Sum of m1 and m2'
        );
        expect(MeasureConverter.convertMeasure(arithmeticMeasure)).toEqual({
            ...afm.arithmeticMeasure
        });
        expect(MeasureConverter.convertMeasure(arithmeticMeasure)).toEqual({
            ...afm.arithmeticMeasure
        });
    });

    describe('getFormat', () => {
        it('should return default format for arithmetic measure sum operation', () => {
            const arithmeticMeasure =
                measures.buildArithmeticMeasure('am1', { operator: 'sum' });
            expect(MeasureConverter.getFormat(arithmeticMeasure)).toBeUndefined();
        });

        it('should return percentage format for change operation', () => {
            const arithmeticMeasure =
                measures.buildArithmeticMeasure('am1', { operator: 'change' });
            expect(MeasureConverter.getFormat(arithmeticMeasure)).toEqual('#,##0.00%');
        });
    });
});
