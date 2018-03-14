// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';

const afm: AFM.IAfm = {
    measures: [
        {
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279'
                    }
                }
            },
            localIdentifier: 'amountMetric',
            format: '#,##0.00',
            alias: 'Amount'
        },
        {
            definition: {
                measure: {
                    item: {
                        uri: '/gdc/md/hkajsdfkhdfkjshdfkhkdasjfh/obj/1280'
                    }
                }
            },
            localIdentifier: 'sizeMetric',
            format: '#,##0.00',
            alias: 'Size'
        }
    ],
    attributes: [
        {
            displayForm: {
                uri: '/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027'
            },
            localIdentifier: 'departmentAttribute'
        }
    ]
};

const resultSpec: AFM.IResultSpec = {
    dimensions: [
        {
            itemIdentifiers: [
                'departmentAttribute'
            ],
            totals: [
                {
                    measureIdentifier: 'amountMetric',
                    type: 'sum',
                    attributeIdentifier: 'departmentAttribute'
                },
                {
                    measureIdentifier: 'sizeMetric',
                    type: 'sum',
                    attributeIdentifier: 'departmentAttribute'
                },
                {
                    measureIdentifier: 'amountMetric',
                    type: 'avg',
                    attributeIdentifier: 'departmentAttribute'
                }
            ]
        },
        {
            itemIdentifiers: [
                'measureGroup'
            ]
        }
    ]
};

export const executionRequestWithTotals: AFM.IExecution = {
    execution: {
        afm,
        resultSpec
    }
};
