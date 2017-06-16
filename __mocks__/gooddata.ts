import range = require('lodash/range');
import { ISimpleExecutorResult } from '../src/interfaces/SimpleExecutorResult';
import { charts } from './fixtures';

const execution = {
    getData(_projectId, columns): Promise<ISimpleExecutorResult> {
        if (columns.indexOf('too-large-measure') >= 0) {
            return Promise.reject({
                response: {
                    status: 413
                }
            });
        }

        if (columns.indexOf('bad-request') >= 0) {
            return Promise.reject({
                response: {
                    status: 400
                }
            });
        }

        if (columns.indexOf('empty-result') >= 0) {
            return Promise.resolve({
                rawData: [[]],
                isEmpty: true,
                headers: [{
                    id: 'abcd',
                    title: 'Attribute',
                    type: 'attrLabel',
                    uri: '/gdc/md/project/obj/1'
                }]
            });
        }

        if (columns.indexOf('negative-values-measure') >= 0) {
            return Promise.resolve({
                rawData: [['-1000']],
                isEmpty: false,
                headers: [{
                    id: 'negative-values-measure',
                    title: 'Negative values measure',
                    type: 'metric',
                    uri: '/gdc/md/project/obj/1'
                }]
            });
        }

        if (columns.indexOf('too-large-for-pie') >= 0) {
            return Promise.resolve({
                rawData: [
                    ...range(0, 21).map(i => [`${i}`])
                ],
                isEmpty: false,
                headers: [{
                    id: 'too-large-for-pie',
                    title: 'Attributes',
                    type: 'attrLabel',
                    uri: '/gdc/md/project/obj/1'
                }]
            });
        }

        return Promise.resolve({
            isLoaded: true,
            headers: [
                {
                    type: 'attrLabel',
                    id: 'date.aci81lMifn6q',
                    uri: '/gdc/md/budtwmhq7k94ve7rqj49j3620rzsm3u1/obj/851',
                    title: 'Quarter/Year (Date)'
                },
                {
                    type: 'metric',
                    id: '70026c20a1747d3e8215dbcc8a734888',
                    title: '# Logged-in Users',
                    format: '#,##0.00'
                },
                {
                    type: 'metric',
                    id: 'b1296cf75d1c2202667485a44013183e',
                    title: '# Users Opened AD',
                    format: '#,##0'
                }
            ],
            rawData: [
                [
                    'Q3/2016',
                    '56366',
                    '2610'
                ],
                [
                    'Q4/2016',
                    '57952',
                    '2779'
                ],
                [
                    'Q1/2017',
                    '60712',
                    '3013'
                ],
                [
                    'Q2/2017',
                    '53183',
                    '2072'
                ]
            ],
            warnings: [

            ],
            isEmpty: false
        });
    },

    getDataForVis(): Promise<ISimpleExecutorResult>  {
        return Promise.resolve({
            rawData: [['10000']],
            headers: [{
                id: 'abcd',
                title: 'Attribute',
                type: 'attrLabel',
                uri: '/gdc/md/project/obj/1'
            }]
        });
    }
};

const xhr = {
    get(uri) {
        const chart = charts.find(viz => viz.visualization.meta.uri === uri);

        if (chart) {
            return Promise.resolve(chart);
        }

        return Promise.reject('Chart not found');
    }
};

const md = {
    getObjects() {
        return Promise.resolve([]);
    }
};

export {
    execution,
    xhr,
    md
};
