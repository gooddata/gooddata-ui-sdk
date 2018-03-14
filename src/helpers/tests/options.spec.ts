// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { getVisualizationOptions } from '../options';

describe('getVisualizationOptions', () => {
    function createAfm(measures: AFM.IMeasure[]): AFM.IAfm {
        return  { measures };
    }

    function createDateFilter(): AFM.IRelativeDateFilter {
        return {
            relativeDateFilter: {
                dataSet: { identifier: 'foo' },
                from: -1,
                to: -1,
                granularity: 'GDC.time.year'
            }
        };
    }

    function createAttributeFilter(): AFM.IPositiveAttributeFilter {
        return {
            positiveAttributeFilter: {
                displayForm: { identifier: 'foo' },
                in: []
            }
        };
    }

    function createMeasure(filters: AFM.FilterItem[]): AFM.IMeasure {
        return {
            localIdentifier: 'foo',
            definition: {
                measure: {
                    item: { identifier: 'bar' },
                    filters
                }
            }
        };
    }

    function createPopMeasure(): AFM.IMeasure {
        return {
            localIdentifier: 'popFoo',
            definition: {
                popMeasure: {
                    measureIdentifier: 'foo',
                    popAttribute: { uri: 'abc' }
                }
            }
        };
    }

    describe('dateOptionsDisabled', () => {
        it('should be true if all metrics use date filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should be true if all metrics use date filter and also attribute filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter(), createAttributeFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should be false if all metrics use attribute filter only', () => {
            const afm = createAfm([
                createMeasure([createAttributeFilter()]),
                createMeasure([createAttributeFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should not be influenced by PoP measure', () => {
            const afm1 = createAfm([
                createMeasure([createDateFilter()]),
                createPopMeasure()
            ]);
            expect(getVisualizationOptions(afm1)).toHaveProperty('dateOptionsDisabled', true);

            const afm2 = createAfm([
                createMeasure([]),
                createPopMeasure()
            ]);
            expect(getVisualizationOptions(afm2)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should be false if some metrics use attribute filter and some date filter', () => {
            const afm = createAfm([
                createMeasure([createAttributeFilter()]),
                createMeasure([createDateFilter()])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should be false if some metric use date filter, but some does not use any filter', () => {
            const afm = createAfm([
                createMeasure([createDateFilter()]),
                createMeasure([])
            ]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should be false if there are no metrics', () => {
            const afm = createAfm([]);
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should be false if AFM is empty object', () => {
            const afm = {};
            expect(getVisualizationOptions(afm)).toHaveProperty('dateOptionsDisabled', false);
        });
    });
});
