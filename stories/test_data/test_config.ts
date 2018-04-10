// (C) 2007-2018 GoodData Corporation
import { assign } from 'lodash';

export const barChart2Series: any = {
    type: 'line',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            },
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/2825',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
                    dateFilterSettings: {
                        granularity: 'GDC.time.year'
                    }
                }
            }
        ],
        filters: [
            {
                dateFilterSettings: {
                    granularity: 'GDC.time.year',
                    dataSet: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324'
                }
            }
        ]
    }
};

export const stackedBar: any = {
    type: 'column',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'attribute',
                    collection: 'attribute',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028'
                }
            },
            {
                category: {
                    type: 'attribute',
                    collection: 'stack',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805'
                }
            }
        ],
        filters: [
            {
                listAttributeFilter: {
                    attribute: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1025',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028',
                    default: {
                        negativeSelection: true,
                        attributeElements: []
                    }
                }
            },
            {
                listAttributeFilter: {
                    attribute: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1095',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805',
                    default: {
                        negativeSelection: true,
                        attributeElements: []
                    }
                }
            }
        ]
    }
};

export const pie: any = {
    type: 'pie',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
                    dateFilterSettings: {
                        granularity: 'GDC.time.year'
                    }
                }
            }
        ],
        filters: [
            {
                dateFilterSettings: {
                    granularity: 'GDC.time.year',
                    dataSet: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324'
                }
            }
        ]
    }
};

export const metricPie: any = {
    type: 'pie',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            },
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            },
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13468',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [],
        filters: [
            {
                dateFilterSettings: {
                    granularity: 'GDC.time.year',
                    dataSet: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324'
                }
            }
        ]
    }
};

export const bar: any = assign({}, barChart2Series, { type: 'bar' });
export const column: any = assign({}, metricPie, { type: 'column' });

export const longBar: any = {
    type: 'column',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/9211',
                    title: '_Close [BOP]',
                    measureFilters: [],
                    showInPercent: false,
                    showPoP: false
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'attribute',
                    collection: 'view',
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970'
                }
            }, {
                category: {
                    type: 'attribute',
                    collection: 'stack',
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970'
                }
            }
        ],
        filters: [
            {
                listAttributeFilter: {
                    attribute: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/969',
                    displayForm: '/gdc/md/oim7k9wbfmhq1xcpbuwvr41pl7ztaat7/obj/970',
                    default: {
                        negativeSelection: true,
                        attributeElements: []
                    }
                }
            }
        ]
    }
};
