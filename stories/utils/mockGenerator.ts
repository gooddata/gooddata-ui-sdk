// (C) 2007-2018 GoodData Corporation
import { range, unzip, isNumber } from 'lodash';

function generateRawData(fns: any, length: any) {
    const data = [(x: any) => ({ id: x, name: x.toString() }), ...fns].map((fn: any) => {
        return range(1, length + 1).map((n) => {
            const res = fn(n);

            return isNumber(res) ? `${res}` : res;
        });
    });

    return unzip(data);
}

export function createMock(type: any, fnsConfig: any, length: any) {
    const fns = fnsConfig.map((config: any) => config.fn);
    const rawData = generateRawData(fns, length);
    const metricHeaders = fnsConfig.map((config: any, i: any) => {
        const n = i + 1;
        return {
            type: 'metric',
            id: n.toString(),
            uri: `/gdc/md/${n}`,
            title: config.title,
            format: '#,##0.00'
        };
    });

    const config = {
        type,
        buckets: {
            categories: [
                {
                    category: {
                        collection: 'attribute',
                        displayForm: '/gdc/md/attr'
                    }
                }
            ]
        }
    };

    return {
        data: {
            rawData,
            headers: [
                {
                    type: 'attrLabel',
                    id: 'attr',
                    uri: '/gdc/md/attr',
                    title: 'N'
                },
                ...metricHeaders
            ],
            isLoading: false,
            isLoaded: true
        },
        config
    };
}
