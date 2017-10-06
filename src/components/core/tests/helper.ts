import { VisualizationObject } from '@gooddata/data-layer';

export function getComponentProps(visualizationType: VisualizationObject.VisualizationType) {
    return {
        dataSource: {
            getData: () => Promise.resolve({}),
            getAfm: () => ({}),
            getFingerprint: () => '{}'
        },
        metadataSource: {
            getVisualizationMetadata: () => Promise.resolve({
                metadata: {
                    meta: {
                        title: 'Title'
                    },
                    content: {
                        type: visualizationType,
                        buckets: {
                            measures: [],
                            categories: [],
                            filters: []
                        }
                    }
                },
                measuresMap: {}
            }),
            getFingerprint: () => '{}'
        }
    };
}
