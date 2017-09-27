import { getVisualizationOptions } from '../options';

describe('getVisualizationOptions', () => {
    let metadata;

    beforeEach(() => metadata = {
        content: {
            buckets: {
                measures: [],
                categories: []
            }
        }
    });

    describe('dateOptionsDisabled', () => {
        it('should return true if all metrics use date filter', () => {
            metadata.content.buckets.measures = [
                { measure: { measureFilters: [{ dateFilter: 'foo' }] } },
                { measure: { measureFilters: [{ dateFilter: 'bar' }] } }
            ];
            expect(getVisualizationOptions(metadata)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should return true if all metrics use date filter and also attribute filter', () => {
            metadata.content.buckets.measures = [
                { measure: { measureFilters: [{ dateFilter: 'foo' }, { listAttributeFilter: 'baz' }] } },
                { measure: { measureFilters: [{ dateFilter: 'bar' }] } }
            ];
            expect(getVisualizationOptions(metadata)).toHaveProperty('dateOptionsDisabled', true);
        });

        it('should return false if all metrics use attribute filter only', () => {
            metadata.content.buckets.measures = [
                { measure: { measureFilters: [{ listAttributeFilter: 'foo' }] } },
                { measure: { measureFilters: [{ listAttributeFilter: 'bar' }] } }
            ];
            expect(getVisualizationOptions(metadata)).toHaveProperty('dateOptionsDisabled', false);
        });

        it('should return false if some metrics use attribute filter and some date filter', () => {
            metadata.content.buckets.measures = [
                { measure: { measureFilters: [{ dateFilter: 'foo' }] } },
                { measure: { measureFilters: [{ metadata: 'bar' }] } }
            ];
            expect(getVisualizationOptions(metadata)).toHaveProperty('dateOptionsDisabled', false);
        });


        it('should return false if some metric use date filter, but some does not use any filter', () => {
            metadata.content.buckets.measures = [
                { measure: { measureFilters: [{ dateFilter: 'foo' }] } },
                { measure: { measureFilters: [] } }
            ];
            expect(getVisualizationOptions(metadata)).toHaveProperty('dateOptionsDisabled', false);
        });
    });
});
