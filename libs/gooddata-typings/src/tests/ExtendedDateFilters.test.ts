// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from '../ExtendedDateFilters';

describe('ExtendedDateFilters', () => {
    const absoluteForm: ExtendedDateFilters.IAbsoluteDateFilterForm = {
        from: '2000-01-01',
        localIdentifier: 'foo',
        to: '2020-01-01',
        type: 'absoluteForm',
        name: 'Absolute Form',
        visible: true
    };

    const absolutePreset: ExtendedDateFilters.IAbsoluteDateFilterPreset = {
        from: '2000-01-01',
        localIdentifier: 'foo',
        name: 'bar',
        to: '2020-01-01',
        type: 'absolutePreset',
        visible: true
    };

    const relativeForm: ExtendedDateFilters.IRelativeDateFilterForm = {
        from: -2,
        granularity: 'GDC.time.date',
        availableGranularities: ['GDC.time.date'],
        localIdentifier: 'foo',
        name: 'bar',
        to: 0,
        type: 'relativeForm',
        visible: true
    };

    const relativePreset: ExtendedDateFilters.IRelativeDateFilterPreset = {
        from: -2,
        granularity: 'GDC.time.date',
        localIdentifier: 'foo',
        name: 'bar',
        to: 0,
        type: 'relativePreset',
        visible: true
    };

    const allTimeFilter: ExtendedDateFilters.IAllTimeDateFilter = {
        localIdentifier: 'foo',
        type: 'allTime',
        name: 'All time',
        visible: true
    };

    describe('isAllTimeDateFilter', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative form', relativeForm],
            ['a relative preset', relativePreset],
            ['an absolute form', absoluteForm],
            ['an absolute preset', absolutePreset]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isAllTimeDateFilter(input);
            expect(result).toEqual(false);
        });

        it('should return true when an all-time filter is tested', () => {
            const result = ExtendedDateFilters.isAllTimeDateFilter(allTimeFilter);
            expect(result).toEqual(true);
        });
    });

    describe('isAbsoluteDateFilterForm', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative form', relativeForm],
            ['a relative preset', relativePreset],
            ['an absolute preset', absolutePreset],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterForm(input);
            expect(result).toEqual(false);
        });

        it('should return true when an absolute form is tested', () => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterForm(absoluteForm);
            expect(result).toEqual(true);
        });
    });

    describe('isAbsoluteDateFilterPreset', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative form', relativeForm],
            ['a relative preset', relativePreset],
            ['an absolute form', absoluteForm],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterPreset(input);
            expect(result).toEqual(false);
        });

        it('should return true when an absolute preset is tested', () => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterPreset(absolutePreset);
            expect(result).toEqual(true);
        });
    });

    describe('isRelativeDateFilterForm', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative preset', relativePreset],
            ['an absolute form', absoluteForm],
            ['an absolute preset', absolutePreset],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isRelativeDateFilterForm(input);
            expect(result).toEqual(false);
        });

        it('should return true when a relative form is tested', () => {
            const result = ExtendedDateFilters.isRelativeDateFilterForm(relativeForm);
            expect(result).toEqual(true);
        });
    });

    describe('isRelativeDateFilterPreset', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative form', relativeForm],
            ['an absolute form', absoluteForm],
            ['an absolute preset', absolutePreset],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isRelativeDateFilterPreset(input);
            expect(result).toEqual(false);
        });

        it('should return true when a relative preset is tested', () => {
            const result = ExtendedDateFilters.isRelativeDateFilterPreset(relativePreset);
            expect(result).toEqual(true);
        });
    });

    describe('isAbsoluteDateFilterOption', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative form', relativeForm],
            ['a relative preset', relativePreset],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it.each([
            ['an absolute form', absoluteForm],
            ['an absolute preset', absolutePreset]
        ])('should return true when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterOption(input);
            expect(result).toEqual(true);
        });
    });

    describe('isRelativeDateFilterOption', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['an absolute form', absoluteForm],
            ['an absolute preset', absolutePreset],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isRelativeDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it.each([
            ['a relative form', relativeForm],
            ['a relative preset', relativePreset]
        ])('should return false when %s is tested', (_: any, input: any) => {
            const result = ExtendedDateFilters.isRelativeDateFilterOption(input);
            expect(result).toEqual(true);
        });
    });
});
