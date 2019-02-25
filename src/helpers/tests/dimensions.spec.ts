// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, AFM } from '@gooddata/typings';
import cloneDeep = require('lodash/cloneDeep');
import update = require('lodash/update');

import { VisualizationTypes } from '../../constants/visualizationTypes';
import {
    generateDimensions,
    getHeadlinesDimensions,
    getPivotTableDimensions,
    generateStackedDimensions,
    getGeneralDimensionsFromAFM
} from '../dimensions';
import { visualizationObjects } from '../../../__mocks__/fixtures';
import { MEASURE_1, ATTRIBUTE_CITIES } from '../../../stories/data/afmComponentProps';
import { MEASURES, ATTRIBUTE, COLUMNS } from '../../constants/bucketNames';

function getVisualization(name: string): VisualizationObject.IVisualizationObjectContent {
    const uri = `/gdc/md/myproject/obj/${name}`;
    const visObj = visualizationObjects.find(chart => chart.visualizationObject.meta.uri === uri);

    if (!visObj) {
        throw new Error(`Unknown uri ${uri}`);
    }

    return visObj.visualizationObject.content;
}

function getVisualizationBucket(newVis: VisualizationObject.IVisualizationObjectContent, bucketName: string):
VisualizationObject.IBucket {

    let bucketIndex = newVis.buckets.findIndex(bucket => bucket.localIdentifier === bucketName);
    if (bucketIndex < 0) {
        update(newVis, ['buckets'], (buckets: VisualizationObject.IBucket[]) => {
            buckets.push({
                localIdentifier: bucketName,
                items: []
            });
            return buckets;
        });
        bucketIndex = newVis.buckets.length - 1;
    }

    return newVis.buckets[bucketIndex];
}

function addMeasure(
    visualization: VisualizationObject.IVisualizationObjectContent,
    index: number
): VisualizationObject.IVisualizationObjectContent {
    const newVis: VisualizationObject.IVisualizationObjectContent = cloneDeep(visualization);
    const measure = {
        measure: {
            localIdentifier: `m${index}`,
            title: `# Users Opened AD ${index}`,
            definition: {
                measureDefinition: {
                    item: {
                        uri: `/gdc/md/myproject/obj/150${index}`
                    }
                }
            }
        }
    };
    return update<VisualizationObject.IVisualizationObjectContent>(
        newVis, ['buckets', 0, 'items'], (measures: VisualizationObject.IMeasure[]
    ) => {
        measures.push(measure);
        return measures;
    });
}

function addAttribute(
    visualization: VisualizationObject.IVisualizationObjectContent,
    index: number,
    bucketName: string
): VisualizationObject.IVisualizationObjectContent {
    const newVis = cloneDeep(visualization);
    const visualizationAttribute = {
        visualizationAttribute: {
            localIdentifier: `a${index}`,
            displayForm: {
                uri: `/gdc/md/myproject/obj/400${index}`
            }
        }
    };

    const bucket = getVisualizationBucket(newVis, bucketName);
    bucket.items.push(visualizationAttribute);

    return newVis;
}

function addTotals(
    visualization: VisualizationObject.IVisualizationObjectContent,
    bucketName: string,
    newTotals: VisualizationObject.IVisualizationTotal[]
): VisualizationObject.IVisualizationObjectContent {
    const newVis: VisualizationObject.IVisualizationObjectContent = cloneDeep(visualization);

    const bucket = getVisualizationBucket(newVis, bucketName);

    if (!bucket.totals) {
        bucket.totals = [];
    }

    newTotals.forEach((total) => {
        bucket.totals.push(total);
    });

    return newVis;
}

describe('getHeadlinesDimensions', () => {
    it('should always return just one dimension with a measureGroup', () => {
        const expectedDimensions: AFM.IDimension[] = [
            {
                itemIdentifiers: ['measureGroup']
            }
        ];

        expect(getHeadlinesDimensions()).toEqual(expectedDimensions);
    });
});

describe('getPivotTableDimensions', () => {
    // tslint:disable-next-line:max-line-length
    it('should return row attributes in the first dimensions, column attributes and measureGroup in second dimension', () => {
        const expectedDimensions: AFM.IDimension[] = [
            {
                itemIdentifiers: ['a1']
            },
            {
                itemIdentifiers: ['a2', 'measureGroup']
            }
        ];

        const buckets = [
            {
                localIdentifier: MEASURES,
                items: [{
                    measure: {
                        localIdentifier: 'm1',
                        title: '# Accounts with AD Query',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/myproject/obj/m1'
                                }
                            }
                        }
                    }
                }]
            },
            {
                // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
                localIdentifier: ATTRIBUTE,
                items: [{
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: '/gdc/md/myproject/obj/a1'
                        }
                    }
                }]
            },
            {
                localIdentifier: COLUMNS,
                items: [{
                    visualizationAttribute: {
                        localIdentifier: 'a2',
                        displayForm: {
                            uri: '/gdc/md/myproject/obj/a2'
                        }
                    }
                }]
            }
        ];

        expect(getPivotTableDimensions(buckets)).toEqual(expectedDimensions);
    });
});

describe('generateDimensions', () => {
    describe('column/bar chart', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: []
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.COLUMN))
                .toEqual(expectedDimensions);
            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.BAR))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and view attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: ['a1']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'view');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.COLUMN))
                .toEqual(expectedDimensions);
            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.BAR))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithStackAttribute = addAttribute(visualization, 1, 'stack');

            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.COLUMN))
                .toEqual(expectedDimensions);
            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.BAR))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure, view attribute and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a2']
                },
                {
                    itemIdentifiers: ['a1', 'measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, 'view'),
                2,
                'stack'
            );

            expect(generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.COLUMN))
                .toEqual(expectedDimensions);
            expect(generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.BAR))
                .toEqual(expectedDimensions);
        });
    });
    describe('heatmap', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.HEATMAP))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and view attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'view');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.HEATMAP))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['a1', 'measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithStackAttribute = addAttribute(visualization, 1, 'stack');

            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.HEATMAP))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure, view attribute and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: ['a2', 'measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, 'view'),
                2,
                'stack'
            );

            expect(generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.HEATMAP))
                .toEqual(expectedDimensions);
        });
    });
    describe('line chart', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: []
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.LINE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and view attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: ['a1']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'trend');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'segment');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure, view attribute and stack attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a2']
                },
                {
                    itemIdentifiers: ['a1', 'measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, 'trend'),
                2,
                'segment'
            );

            expect(generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.LINE))
                .toEqual(expectedDimensions);
        });
    });
    describe('pie chart', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.PIE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and view attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: ['a1']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'view');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.PIE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and 2 view attributes', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: ['a1', 'a2']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWith2ViewAttributes = addAttribute(addAttribute(visualization, 1, 'view'), 2, 'view');

            expect(generateDimensions(visualizationWith2ViewAttributes, VisualizationTypes.PIE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for two measures', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.PIE))
                .toEqual(expectedDimensions);
        });
    });
    describe('treemap', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.TREEMAP))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and view attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['measureGroup']
                },
                {
                    itemIdentifiers: ['a1']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithViewAttribute = addAttribute(visualization, 1, 'view');

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.TREEMAP))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for two measures', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.TREEMAP))
                .toEqual(expectedDimensions);
        });
    });
    describe('table', () => {
        it('should generate dimensions for one measure', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            expect(generateDimensions(getVisualization('onemeasure'), VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: []
                }
            ];

            expect(generateDimensions(getVisualization('oneattribute'), VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and attribute', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1']
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWithAttribute = addAttribute(visualization, 1, 'attribute');

            expect(generateDimensions(visualizationWithAttribute, VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for one measure and 2 attributes', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: ['a1', 'a2']
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWith2Attributes = addAttribute(
                addAttribute(visualization, 1, 'attribute'),
                2,
                'attribute'
            );

            expect(generateDimensions(visualizationWith2Attributes, VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions for two measures', () => {
            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: []
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];

            const visualization = getVisualization('onemeasure');
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });

        it('should generate dimensions with totals', () => {
            const expectedTotals: AFM.ITotalItem[] = [{
                measureIdentifier: 'm1',
                attributeIdentifier: 'a1',
                type: 'sum'
            }, {
                measureIdentifier: 'm2',
                attributeIdentifier: 'a1',
                type: 'sum'
            }, {
                measureIdentifier: 'm1',
                attributeIdentifier: 'a1',
                type: 'nat'
            }];

            const expectedDimensions: AFM.IDimension[] = [
                {
                    itemIdentifiers: [],
                    totals: expectedTotals
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ];
            const visualization = getVisualization('1');
            const visualizationWithTotals = addTotals(visualization, 'attribute', [{
                measureIdentifier: 'm1',
                attributeIdentifier: 'a1',
                type: 'sum',
                alias: 'Sum'
            }, {
                measureIdentifier: 'm2',
                attributeIdentifier: 'a1',
                type: 'sum'
            }, {
                measureIdentifier: 'm1',
                attributeIdentifier: 'a1',
                type: 'nat'
            }]);

            expect(generateDimensions(visualizationWithTotals, VisualizationTypes.TABLE))
                .toEqual(expectedDimensions);
        });
    });
});

describe('generateStackedDimensions', () => {
    it('measure and stack by only', () => {
        const expectedDimensions: AFM.IDimension[] = [
            {
                itemIdentifiers: ['a2']
            },
            {
                itemIdentifiers: ['measureGroup']
            }
        ];

        const buckets = [
            {
                localIdentifier: 'measures',
                items: [{
                    measure: {
                        localIdentifier: 'm1',
                        title: '# Accounts with AD Query',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/myproject/obj/m1'
                                }
                            }
                        }
                    }
                }]
            },
            {
                localIdentifier: 'stack',
                items: [{
                    visualizationAttribute: {
                        localIdentifier: 'a2',
                        displayForm: {
                            uri: '/gdc/md/myproject/obj/a2'
                        }
                    }
                }]
            }
        ];

        expect(generateStackedDimensions(buckets))
            .toEqual(expectedDimensions);
    });

    it('should return 2 attributes along with measureGroup', () => {
        const buckets = [{
            localIdentifier: 'measures',
            items: [{
                measure: {
                    localIdentifier: 'm1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: '/gdc/md/storybook/obj/1'
                            }
                        }
                    }
                }
            }]
        }, {
            localIdentifier: 'attribute',
            items: [{
                visualizationAttribute: {
                    displayForm: {
                        uri: '/gdc/md/storybook/obj/1.df'
                    },
                    localIdentifier: 'a1'
                }
            }, {
                visualizationAttribute: {
                    displayForm: {
                        uri: '/gdc/md/storybook/obj/2.df'
                    },
                    localIdentifier: 'a2'
                }
            }]
        }, {
            localIdentifier: 'stack',
            items: []
        }];
        const expectedDimensions: AFM.IDimension[] = [{
            itemIdentifiers: []
        }, {
            itemIdentifiers: ['a1', 'a2', 'measureGroup']
        }];
        expect(generateStackedDimensions(buckets)).toEqual(expectedDimensions);
    });

    it('should return 2 attributes along with measureGroup and return 1 stack attribute', () => {
        const buckets = [{
            localIdentifier: 'measures',
            items: [{
                measure: {
                    localIdentifier: 'm1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: '/gdc/md/storybook/obj/1'
                            }
                        }
                    }
                }
            }]
        }, {
            localIdentifier: 'attribute',
            items: [{
                visualizationAttribute: {
                    displayForm: {
                        uri: '/gdc/md/storybook/obj/1.df'
                    },
                    localIdentifier: 'a1'
                }
            }, {
                visualizationAttribute: {
                    displayForm: {
                        uri: '/gdc/md/storybook/obj/3.df'
                    },
                    localIdentifier: 'a3'
                }
            }]
        }, {
            localIdentifier: 'stack',
            items: [{
                visualizationAttribute: {
                    displayForm: {
                        uri: '/gdc/md/storybook/obj/2.df'
                    },
                    localIdentifier: 'a2'
                }
            }]
        }];
        const expectedDimensions: AFM.IDimension[] = [{
            itemIdentifiers: ['a2']
        }, {
            itemIdentifiers: ['a1', 'a3', 'measureGroup']
        }];
        expect(generateStackedDimensions(buckets)).toEqual(expectedDimensions);
    });
});

describe('getGeneralDimensionsFromAFM', () => {
    it('should return resultSpec dimensions for AFM with both measures and attributes', () => {
        const afm = {
            measures: [MEASURE_1],
            attributes: [ATTRIBUTE_CITIES]
        };
        const expectedDimensions = [{ itemIdentifiers: ['a1'] }, { itemIdentifiers: ['measureGroup'] }];
        expect(getGeneralDimensionsFromAFM(afm)).toEqual(expectedDimensions);
    });
    it('should return resultSpec dimensions for AFM with measures only', () => {
        const afm = {
            measures: [MEASURE_1]
        };
        const expectedDimensions = [{ itemIdentifiers: ['measureGroup'] }];
        expect(getGeneralDimensionsFromAFM(afm)).toEqual(expectedDimensions);
    });
    it('should return resultSpec dimensions for AFM with attributes only', () => {
        const afm = {
            attributes: [ATTRIBUTE_CITIES]
        };
        const expectedDimensions = [{ itemIdentifiers: ['a1'] }];
        expect(getGeneralDimensionsFromAFM(afm)).toEqual(expectedDimensions);
    });
});
