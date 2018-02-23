import { VisualizationObject } from '@gooddata/typings';

export function isStackedChart(buckets: VisualizationObject.IBucket[]) {
    return buckets.some(bucket => bucket.localIdentifier === 'stacks' && bucket.items.length > 0);
}
