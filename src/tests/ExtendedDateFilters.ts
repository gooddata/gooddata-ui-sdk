// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from '../ExtendedDateFilters';

describe('ExtendedDateFilters', () => {
    const absoluteFilter: ExtendedDateFilters.IAbsoluteDateFilterForm = {
        from: '2000-01-01',
        localIdentifier: 'foo',
        to: '2020-01-01',
        type: 'absoluteForm'
    };

    const relativeFilter: ExtendedDateFilters.IRelativeDateFilterPreset = {
        from: -2,
        granularity: 'GDC.time.date',
        localIdentifier: 'foo',
        name: 'bar',
        to: 0,
        type: 'relativePreset'
    };

    const allTimeFilter: ExtendedDateFilters.IAllTimeDateFilter = {
        localIdentifier: 'foo',
        type: 'allTime'
    };

    describe('isAbsoluteDateFilterOption', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['a relative filter', relativeFilter],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_, input) => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it('should return true when an absolute filter is tested', () => {
            const result = ExtendedDateFilters.isAbsoluteDateFilterOption(absoluteFilter);
            expect(result).toEqual(true);
        });
    });

    describe('isRelativeDateFilterOption', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
            ['an absolute filter', absoluteFilter],
            ['an all-time filter', allTimeFilter]
        ])('should return false when %s is tested', (_, input) => {
            const result = ExtendedDateFilters.isRelativeDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it('should return true when a relative filter is tested', () => {
            const result = ExtendedDateFilters.isRelativeDateFilterOption(relativeFilter);
            expect(result).toEqual(true);
        });
    });
});
