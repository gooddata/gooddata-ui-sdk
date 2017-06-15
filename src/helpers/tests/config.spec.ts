import { getLegendConfig, getConfig } from '../config';
import { VisualizationObject } from '@gooddata/data-layer';

describe('getLegendConfig', () => {
    const emptyMetadataObject = {
        content: {
            type: 'bar' as VisualizationObject.VisualizationType,
            buckets: {
                measures: [],
                categories: [],
                filters: []
            }
        },
        meta: {}
    };
    it('should return static response if environment is dashboards', () => {
        const expected = {
            enabled: true,
            position: 'right',
            responsive: true
        };
        const response = getLegendConfig(emptyMetadataObject, 'dashboards');
        expect(response).toEqual(expected);
    });

    it('should set legend config on top by default', () => {
        const expected = {
            enabled: true,
            position: 'top'
        };
        const result = getLegendConfig(emptyMetadataObject, 'ad');
        expect(result).toEqual(expected);
    });

    it('should set legend config on top', () => {
        const metadata = {
            content: {
                type: 'bar',
                buckets: {
                    categories: [{
                        category: {
                            type: 'attribute',
                            collection: 'view',
                            displayForm: ''
                        }
                    }],
                    measures: [],
                    filters: []
                }
            },
            meta: {}
        } as VisualizationObject.IVisualizationObjectMetadata;
        const expected = {
            enabled: true,
            position: 'top'
        };
        const result = getLegendConfig(metadata, 'ad');
        expect(result).toEqual(expected);
    });

    it('should set legend config on right when stack', () => {
        const metadata = {
            content: {
                type: 'bar',
                buckets: {
                    categories: [{
                        category: {
                            type: 'attribute',
                            collection: 'view',
                            displayForm: ''
                        }
                    }, {
                        category: {
                            type: 'attribute',
                            collection: 'stack',
                            displayForm: ''
                        }
                    }],
                    measures: [],
                    filters: []
                }
            },
            meta: {}
        } as VisualizationObject.IVisualizationObjectMetadata;
        const expected = {
            enabled: true,
            position: 'right'
        };
        const result = getLegendConfig(metadata, 'ad');
        expect(result).toEqual(expected);
    });

    it('should set legend config on right when segment', () => {
        const metadata = {
            content: {
                type: 'bar',
                buckets: {
                    categories: [{
                        category: {
                            type: 'attribute',
                            collection: 'segment',
                            displayForm: ''
                        }
                    }],
                    measures: [],
                    filters: []
                }
            },
            meta: {}
        } as VisualizationObject.IVisualizationObjectMetadata;
        const expected = {
            enabled: true,
            position: 'right'
        };
        const result = getLegendConfig(metadata, 'ad');
        expect(result).toEqual(expected);
    });
});

describe('getConfig', () => {
    it('should return valid config', () => {
        const buckets = {
            categories: [{
                category: {
                    type: 'attribute',
                    collection: 'segment',
                    displayForm: ''
                }
            }],
            measures: [],
            filters: []
        };
        const metadata = {
            content: {
                type: 'line',
                buckets
            },
            meta: {}
        } as VisualizationObject.IVisualizationObjectMetadata;
        const type = 'line';
        const environment = 'dashboards';
        const expected = {
            type,
            buckets,
            legend: {
                enabled: true,
                position: 'right',
                responsive: true
            }
        };
        const result = getConfig(metadata, type, environment);
        expect(result).toEqual(expected);
    });
});
