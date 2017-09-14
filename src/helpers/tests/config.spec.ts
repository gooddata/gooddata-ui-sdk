import { getLegendConfig, getConfig } from '../config';
import { VisualizationObject } from '@gooddata/data-layer';
import { VisualizationTypes } from '../../constants/visualizationTypes';

describe('getLegendConfig', () => {
    const emptyMetadataObject: VisualizationObject.IVisualizationObject = {
        content: {
            type: VisualizationTypes.BAR as VisualizationObject.VisualizationType,
            buckets: {
                measures: [],
                categories: [],
                filters: []
            }
        },
        meta: {
            title: 'Title'
        }
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
        const metadata: VisualizationObject.IVisualizationObject = {
            content: {
                type: VisualizationTypes.BAR,
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
            meta: {
                title: 'foo'
            }
        };
        const expected = {
            enabled: true,
            position: 'top'
        };
        const result = getLegendConfig(metadata, 'ad');
        expect(result).toEqual(expected);
    });

    it('should set legend config on right when stack', () => {
        const metadata: VisualizationObject.IVisualizationObject = {
            content: {
                type: VisualizationTypes.BAR,
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
            meta: {
                title: 'foo'
            }
        };
        const expected = {
            enabled: true,
            position: 'right'
        };
        const result = getLegendConfig(metadata, 'ad');
        expect(result).toEqual(expected);
    });

    it('should set legend config on right when segment', () => {
        const metadata: VisualizationObject.IVisualizationObject = {
            content: {
                type: VisualizationTypes.BAR,
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
            meta: {
                title: 'foo'
            }
        };
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
        const buckets: VisualizationObject.IBuckets = {
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
        const metadata: VisualizationObject.IVisualizationObject = {
            content: {
                type: VisualizationTypes.LINE,
                buckets
            },
            meta: {
                title: 'foo'
            }
        };
        const type = VisualizationTypes.LINE;
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
