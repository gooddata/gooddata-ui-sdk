// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { getDefaultTreemapSort } from '../sorts';

describe('sorts', () => {
    const measure1 = {
        alias: 'Measure m1',
        definition: {
            measure: {
                item: {
                    identifier: 'ident_m1'
                }
            }
        },
        localIdentifier: 'm1'
    };
    const attribute1 = {
        localIdentifier: 'a1',
        displayForm: {
            identifier: 'ident_a1'
        }
    };
    const attribute2 = {
        localIdentifier: 'a2',
        displayForm: {
            identifier: 'ident_a2'
        }
    };

    const nonStackedAfm: AFM.IAfm = {
        measures: [ measure1 ],
        attributes: [ attribute1 ]
    };

    const nonStackedResultSpec: AFM.IResultSpec = {
        dimensions: [{
            itemIdentifiers: ['a1']
        }, {
            itemIdentifiers: []
        }]
    };

    const stackedAfm: AFM.IAfm = {
        measures: [ measure1 ],
        attributes: [ attribute1, attribute2 ]
    };

    const stackedResultSpec: AFM.IResultSpec = {
        dimensions: [{
            itemIdentifiers: ['a1', 'a2']
        }, {
            itemIdentifiers: []
        }]
    };

    describe('getDefaultTreemapSort', () => {
        it('should get empty sort for only a single attribute', () => {
            const sort = getDefaultTreemapSort(nonStackedAfm, nonStackedResultSpec);
            expect(sort).toEqual([]);
        });

        it('should get attribute and measure sort if view by and stack by', () => {
            const sort = getDefaultTreemapSort(stackedAfm, stackedResultSpec);
            expect(sort).toEqual([{
                attributeSortItem: {
                    direction: 'asc',
                    attributeIdentifier: 'a1'
                }
            }, {
                measureSortItem: {
                    direction: 'desc',
                    locators: [{
                        measureLocatorItem: {
                            measureIdentifier: 'm1'
                        }
                    }]
                }
            }]);
        });
    });
});
