import { getVisualizationOptions } from '../options';
import { Afm } from '@gooddata/data-layer';

describe('getVisualizationOptions', () => {
    function createAfm(measures: Afm.IMeasure[]): Afm.IAfm {
        return  {
            measures
        };
    }

    function createDateFilter(): Afm.IDateFilter {
        return {
            id: 'foo',
            type: 'date',
            intervalType: 'relative',
            between: [-1, -1],
            granularity: 'year'
        };
    }

    function createAttributeFilter(): Afm.IPositiveAttributeFilter {
        return {
            id: 'foo',
            type: 'attribute',
            in: []
        };
    }

    function createMeasure(filters: Afm.IFilter[]): Afm.IMeasure {
        return {
            id: 'foo',
            definition: {
                baseObject: { id: 'bar' },
                filters
            }
        };
    }

    describe('dateOptionsDisabled', () => {
        it('should return true if all metrics use date filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should return true if all metrics use date filter and also attribute filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter(), createAttributeFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should return false if all metrics use attribute filter only', () => {
            const afm = createAfm([
                createMeasure([createAttributeFilter()]),
                createMeasure([createAttributeFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should return false if some metrics use attribute filter and some date filter', () => {
            const afm = createAfm([
                createMeasure([createAttributeFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should return false if some metric use date filter, but some does not use any filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter()]),
                createMeasure([])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should return false if there are no metrics', () => {
            const afm = createAfm([]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should return false if AFM is empty object', () => {
            const afm = {};
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });
    });
});
