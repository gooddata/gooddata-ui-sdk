// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import {
    appendFilters,
    hasMetricDateFilters,
    isAfmExecutable,
    normalizeAfm,
    isDateFilter,
    isAttributeFilter,
    dateFiltersDataSetsMatch,
    ALL_TIME_GRANULARITY
} from '../AfmUtils';
import {
    Granularities
 } from '../../constants/granularities';
import {
    afmWithMetricDateFilter,
    afmWithoutMetricDateFilters
} from '../../fixtures/Afm.fixtures';

describe('hasMetricDateFilters', () => {
    it('TRUE if contains at least one metric date filter', () => {
        const normalizedAfm = normalizeAfm(afmWithMetricDateFilter);
        const result = hasMetricDateFilters(normalizedAfm);
        expect(result).toEqual(true);
    });

    it('FALSE if does not contain any metric date filter', () => {
        const normalizedAfm = normalizeAfm(afmWithoutMetricDateFilters);
        const result = hasMetricDateFilters(normalizedAfm);
        expect(result).toEqual(false);
    });
});

describe('isDateFilter', () => {
    it('should return true for valid date filter', () => {
        const relativeDateFilter: AFM.IRelativeDateFilter = {
            relativeDateFilter: {
                dataSet: {
                    identifier: 'filter'
                },
                from: 1,
                to: 2,
                granularity: Granularities.YEAR
            }
        };
        expect(isDateFilter(relativeDateFilter)).toEqual(true);

        const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
            absoluteDateFilter: {
                dataSet: {
                    identifier: 'filter'
                },
                from: '2001-01-01',
                to: '2001-02-02'
            }
        };
        expect(isDateFilter(absoluteDateFilter)).toEqual(true);
    });

    it('should return false for attribute filter', () => {
        const attributeFilter: AFM.IPositiveAttributeFilter = {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: 'filter'
                },
                in: ['1', '2']
            }
        };
        expect(isDateFilter(attributeFilter)).toEqual(false);
    });
});

describe('isAttributeFilter', () => {
    it('should return true for valid attribute filter', () => {
        const positiveAttributeFilter: AFM.IPositiveAttributeFilter = {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: 'filter'
                },
                in: ['1', '2']
            }
        };
        expect(isAttributeFilter(positiveAttributeFilter)).toEqual(true);

        const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
            negativeAttributeFilter: {
                displayForm: {
                    identifier: 'filter'
                },
                notIn: ['1', '2']
            }
        };
        expect(isAttributeFilter(negativeAttributeFilter)).toEqual(true);
    });

    it('should return false for attribute filter', () => {
        const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
            absoluteDateFilter: {
                dataSet: {
                    identifier: 'filter'
                },
                from: '2001-01-01',
                to: '2001-02-02'
            }
        };
        expect(isAttributeFilter(absoluteDateFilter)).toEqual(false);
    });
});

describe('normalizeAfm', () => {
    it('should add optional arrays - empty', () => {
        const afm: AFM.IAfm = {};
        expect(normalizeAfm(afm)).toEqual({
            measures: [],
            attributes: [],
            filters: [],
            nativeTotals: []
        });
    });

    it('should add optional arrays - measures & filters', () => {
        const expectedAfm: AFM.IAfm = {
            attributes: [
                {
                    localIdentifier: 'a1',
                    displayForm: {
                        identifier: 'a1'
                    }
                }
            ],
            measures: [],
            filters: [],
            nativeTotals: []
        };
        expect(normalizeAfm({
            attributes: [
                {
                    localIdentifier: 'a1',
                    displayForm: {
                        identifier: 'a1'
                    }
                }
            ]
        })).toEqual(expectedAfm);
    });

    it('should add optional arrays - attributes & filters', () => {
        const expectedAfm: AFM.IAfm = {
            measures: [
                {
                    localIdentifier: 'm1',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'm1'
                            }
                        }
                    }
                }
            ],
            attributes: [],
            filters: [],
            nativeTotals: []
        };
        expect(normalizeAfm({
            measures: [
                {
                    localIdentifier: 'm1',
                    definition: {
                        measure: {
                            item: {
                                identifier: 'm1'
                            }
                        }
                    }
                }
            ]
        })).toEqual(expectedAfm);
    });

    it('should add optional arrays - attributes & measures', () => {
        const expectedAfm: AFM.IAfm = {
            attributes: [],
            measures: [],
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: {
                            identifier: '1'
                        },
                        from: 0,
                        to: 1,
                        granularity: Granularities.YEAR
                    }
                }
            ],
            nativeTotals: []
        };
        expect(normalizeAfm({
            filters: [
                {
                    relativeDateFilter: {
                        dataSet: {
                            identifier: '1'
                        },
                        from: 0,
                        to: 1,
                        granularity: Granularities.YEAR
                    }
                }
            ]
        })).toEqual(expectedAfm);
    });
});

describe('AFM utils', () => {
    const af1: AFM.IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            displayForm: {
                identifier: '1'
            },
            in: []
        }
    };
    const af2: AFM.IPositiveAttributeFilter = {
        positiveAttributeFilter: {
            displayForm: {
                identifier: '2'
            },
            in: []
        }
    };

    const relativeDateFilterD1: AFM.IRelativeDateFilter = {
        relativeDateFilter: {
            dataSet: {
                identifier: 'd1'
            },
            from: -1,
            to: -1,
            granularity: Granularities.YEAR
        }
    };

    const absoluteDateFilterD1: AFM.IAbsoluteDateFilter = {
        absoluteDateFilter: {
            dataSet: {
                identifier: 'd1'
            },
            from: '2001-01-01',
            to: '2001-12-12'
        }
    };

    const absoluteDateFilterAb: AFM.IAbsoluteDateFilter = {
        absoluteDateFilter: {
             dataSet: {
                 identifier: 'ab'
             },
             from: '2001-01-01',
             to: '2001-02-02'
        }
    };

    const allTimeDateFilterD1: AFM.IRelativeDateFilter = {
        relativeDateFilter: {
            dataSet: {
                identifier: 'd1'
            },
            from: 0,
            to: 0,
            granularity: ALL_TIME_GRANULARITY
        }
    };

    describe('appendFilters', () => {
        it('should concatenate filters when all different', () => {
            const afm = {
                filters: [
                    af1
                ]
            };
            const attributeFilters = [af2];
            const dateFilter = relativeDateFilterD1;

            const enriched = appendFilters(afm, attributeFilters, dateFilter);
            expect(enriched.filters).toEqual([
                af1, af2, relativeDateFilterD1
            ]);
        });

        it('should override date filter if identifier is identical', () => {
            const afm = {
                filters: [
                    af1, relativeDateFilterD1
                ]
            };
            const attributeFilters: AFM.AttributeFilterItem[] = [];
            const dateFilter = relativeDateFilterD1;

            const enriched = appendFilters(afm, attributeFilters, dateFilter);
            expect(enriched.filters).toEqual([
                af1, relativeDateFilterD1
            ]);
        });

        it('should append date filter if ID different', () => {
            const afm = {
                filters: [
                    relativeDateFilterD1
                ]
            };
            const attributeFilters: AFM.AttributeFilterItem[] = [];
            const dateFilter = absoluteDateFilterAb;

            const enriched = appendFilters(afm, attributeFilters, dateFilter);
            expect(enriched.filters).toEqual([
                absoluteDateFilterAb, relativeDateFilterD1
            ]);
        });

        it('should delete date filter from AFM if "All time" date filter requested', () => {
            const afm = {
                filters: [
                    relativeDateFilterD1
                ]
            };
            const enriched = appendFilters(afm, [], allTimeDateFilterD1);
            expect(enriched.filters).toEqual([]);
        });

        it('should add date filter to empty afm filters', () => {
            const afm: AFM.IAfm = {
                filters: []
            };
            const enriched = appendFilters(afm, [], absoluteDateFilterAb);
            expect(enriched.filters).toEqual([absoluteDateFilterAb]);
        });
    });

    describe('dateFiltersDataSetsMatch', () => {
        it('should match same filters', () => {
            expect(
                dateFiltersDataSetsMatch(relativeDateFilterD1, allTimeDateFilterD1)
            ).toEqual(true);

            expect(
                dateFiltersDataSetsMatch(relativeDateFilterD1, absoluteDateFilterD1)
            ).toEqual(true);
        });

        it('should detect different filters', () => {
            expect(
                dateFiltersDataSetsMatch(relativeDateFilterD1, absoluteDateFilterAb)
            ).toEqual(false);
        });
    });

    describe('isAfmExecutable', () => {
        it('should be false for only filters', () => {
            const afm = {
                filters: [
                    relativeDateFilterD1
                ]
            };

            expect(isAfmExecutable(afm)).toBeFalsy();
        });

        it('should be true for at least one measure', () => {
            const afm: AFM.IAfm = {
                measures: [
                    {
                        localIdentifier: 'm1',
                        definition: {
                            measure: {
                                item: {
                                    identifier: 'm1'
                                },
                                aggregation: 'count'
                            }
                        }
                    }
                ]
            };

            expect(isAfmExecutable(afm)).toBeTruthy();
        });

        it('should be true for at least one attribute', () => {
            const afm: AFM.IAfm = {
                attributes: [
                    {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: '/gdc/project/dsdf1'
                        }
                    }
                ]
            };

            expect(isAfmExecutable(afm)).toBeTruthy();
        });
    });
});
