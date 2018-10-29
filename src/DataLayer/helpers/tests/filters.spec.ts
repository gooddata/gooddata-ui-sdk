// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    Granularities
} from '../../constants/granularities';
import {
    isNotEmptyFilter,
    mergeFilters,
    handleMeasureDateFilter
} from '../filters';

describe('isNotEmptyFilter', () => {
    it('should return true for date filter', () => {
        const dateFilter: AFM.IRelativeDateFilter = {
            relativeDateFilter: {
                dataSet: {
                    identifier: 'date filter'
                },
                from: 0,
                to: 0,
                granularity: Granularities.MONTH
            }
        };

        expect(isNotEmptyFilter(dateFilter)).toBe(true);
    });

    it('should return false for empty positive filter', () => {
        const attributeFilter: AFM.IPositiveAttributeFilter = {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: 'empty filter'
                },
                in: []
            }
        };

        expect(isNotEmptyFilter(attributeFilter)).toBe(false);
    });

    it('should return true for filled positive filter', () => {
        const attributeFilter: AFM.IPositiveAttributeFilter = {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: 'filled filter'
                },
                in: ['1', '2', '3']
            }
        };

        expect(isNotEmptyFilter(attributeFilter)).toBe(true);
    });

    it('should return false for empty negative filter', () => {
        const attributeFilter: AFM.INegativeAttributeFilter = {
            negativeAttributeFilter: {
                displayForm: {
                    identifier: 'empty filter'
                },
                notIn: []
            }
        };

        expect(isNotEmptyFilter(attributeFilter)).toBe(false);
    });

    it('should return true for filled negative filter', () => {
        const attributeFilter: AFM.INegativeAttributeFilter = {
            negativeAttributeFilter: {
                displayForm: {
                    identifier: 'filled filter'
                },
                notIn: ['1', '2', '3']
            }
        };

        expect(isNotEmptyFilter(attributeFilter)).toBe(true);
    });
});

describe('mergeFilters', () => {
    it('should concat existing filters with user filters', () => {
        const afm: AFM.IAfm = {
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: 'filter'
                        },
                        in: ['1', '2', '3']
                    }
                }
            ]
        };

        const filters: AFM.FilterItem[] = [
            {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: 'user filter'
                    },
                    in: ['4', '5', '6']
                }
            }
        ];

        const expectedAfm: AFM.IAfm = {
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: 'filter'
                        },
                        in: ['1', '2', '3']
                    }
                },
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: 'user filter'
                        },
                        in: ['4', '5', '6']
                    }
                }
            ]
        };

        expect(mergeFilters(afm, filters)).toEqual(expectedAfm);
    });

    it('should handle AFM without filters', () => {
        const afm: AFM.IAfm = {};

        const filters: AFM.FilterItem[] = [
            {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: 'user filter'
                    },
                    in: ['4', '5', '6']
                }
            }
        ];
        const expectedAfm: AFM.IAfm = {
            filters: [
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: 'user filter'
                        },
                        in: ['4', '5', '6']
                    }
                }
            ]
        };

        expect(mergeFilters(afm, filters)).toEqual(expectedAfm);
    });
});

describe('handleMeasureDateFilter', () => {
    const dataSet1DateFilterA: AFM.DateFilterItem = {
        relativeDateFilter: {
            dataSet: {
                uri: 'uri/of/dataSet1'
            },
            granularity: 'day',
            from: 1,
            to: 2
        }
    };

    const dataSet1DateFilterB: AFM.DateFilterItem = {
        absoluteDateFilter: {
            dataSet: {
                uri: 'uri/of/dataSet1'
            },
            from: '2000-03-03',
            to: '2000-04-04'
        }
    };

    const dataSet2DateFilterA: AFM.DateFilterItem = {
        absoluteDateFilter: {
            dataSet: {
                identifier: 'dateSet2'
            },
            from: '2000-05-05',
            to: '2000-06-06'
        }
    };

    const dataSet2DateFilterB: AFM.DateFilterItem = {
        relativeDateFilter: {
            dataSet: {
                identifier: 'dateSet2'
            },
            granularity: 'day',
            from: 7,
            to: 8
        }
    };

    const attrFilter1: AFM.IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            displayForm: {
                identifier: 'user filter 1'
            },
            in: ['4', '5', '6']
        }
    };

    const attrFilter2: AFM.INegativeAttributeFilter = {
        negativeAttributeFilter: {
            displayForm: {
                identifier: 'user filter 2'
            },
            notIn: ['4', '5', '6']
        }
    };

    function buildMeasureWithFilters(identifier: AFM.Identifier, filters: AFM.FilterItem[]): AFM.IMeasure {
        return {
            localIdentifier: identifier,
            definition: {
                measure: {
                    item: {
                        identifier
                    },
                    filters
                }
            }
        };
    }

    it('should move single global date filter to measure date filters if dataSet of the filter is not equal', () => {
        const afm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m1', []),
                buildMeasureWithFilters('m2', [dataSet1DateFilterA]),
                buildMeasureWithFilters('m3', [dataSet2DateFilterA]),
                buildMeasureWithFilters('m4', [dataSet1DateFilterA, dataSet2DateFilterA])
            ],
            filters: [
                dataSet1DateFilterB
            ]
        };

        const expectedAfm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m1', [dataSet1DateFilterB]),
                buildMeasureWithFilters('m2', [dataSet1DateFilterA]),
                buildMeasureWithFilters('m3', [dataSet2DateFilterA, dataSet1DateFilterB]),
                buildMeasureWithFilters('m4', [dataSet1DateFilterA, dataSet2DateFilterA])
            ],
            filters: []
        };
        expect(handleMeasureDateFilter(afm)).toEqual(expectedAfm);
    });

    it('should move multiple global date filters to measure date filters if dataSet of the filter is not equal', () => {
        const afm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m1', []),
                buildMeasureWithFilters('m2', [dataSet1DateFilterA]),
                buildMeasureWithFilters('m3', [dataSet2DateFilterA]),
                buildMeasureWithFilters('m4', [dataSet1DateFilterA, dataSet2DateFilterA])
            ],
            filters: [
                dataSet1DateFilterB,
                dataSet2DateFilterB
            ]
        };

        const expectedAfm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m1', [dataSet1DateFilterB, dataSet2DateFilterB]),
                buildMeasureWithFilters('m2', [dataSet1DateFilterA, dataSet2DateFilterB]),
                buildMeasureWithFilters('m3', [dataSet2DateFilterA, dataSet1DateFilterB]),
                buildMeasureWithFilters('m4', [dataSet1DateFilterA, dataSet2DateFilterA])
            ],
            filters: []
        };
        expect(handleMeasureDateFilter(afm)).toEqual(expectedAfm);
    });

    it('should move the global date filters but keep the attribute filters', () => {
        const afm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m5', [dataSet1DateFilterA, attrFilter2])
            ],
            filters: [
                dataSet2DateFilterB,
                attrFilter1
            ]
        };

        const expectedAfm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m5', [dataSet1DateFilterA, attrFilter2, dataSet2DateFilterB])
            ],
            filters: [
                attrFilter1
            ]
        };
        expect(handleMeasureDateFilter(afm)).toEqual(expectedAfm);
    });

    it('should not modify AFM if no metric has date filter', () => {
        const afm: AFM.IAfm = {
            measures: [
                buildMeasureWithFilters('m1', [])
            ],
            filters: [
                dataSet1DateFilterA
            ]
        };
        expect(handleMeasureDateFilter(afm)).toEqual(afm);
    });

    it('should remove global date filter if there is one measure with date filter', () => {
        const measure: AFM.IMeasure = buildMeasureWithFilters('m1', [dataSet1DateFilterB]);
        const afm: AFM.IAfm = {
            measures: [
                measure
            ],
            filters: [
                dataSet1DateFilterA
            ]
        };
        const expectedAfm: AFM.IAfm = {
            measures: [
                measure
            ],
            filters: []
        };
        expect(handleMeasureDateFilter(afm)).toEqual(expectedAfm);
    });

    it('should handle AFM without measures', () => {
        const afmWithFilterOnly: AFM.IAfm = {
            filters: [
                dataSet1DateFilterA
            ]
        };

        expect(handleMeasureDateFilter(afmWithFilterOnly)).toEqual(afmWithFilterOnly);
    });
});
