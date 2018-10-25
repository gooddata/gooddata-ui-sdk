// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    Granularities
} from '../../constants/granularities';
import {
    isNotEmptyFilter,
    mergeFilters
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
