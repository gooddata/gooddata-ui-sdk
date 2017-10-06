import { ISimpleExecutorResult } from 'gooddata';
import { Header } from '@gooddata/data-layer';

const HEADER_MEASURE_1: Header.IMetricHeader = {
    type: Header.HeaderType.Metric,
    id: 'm1',
    title: 'Title m1'
};

const HEADER_MEASURE_2: Header.IMetricHeader = {
    type: Header.HeaderType.Metric,
    id: 'm2',
    title: 'Title m2'
};

function getHeaderAttribute(withIdentifiers: boolean): Header.IAttributeHeader {
    return {
        type: Header.HeaderType.Attribute,
        id: withIdentifiers ? '3.df' : '/gdc/md/storybook/obj/3.df',
        uri: '/gdc/md/storybook/obj/3.df',
        title: withIdentifiers ? 'Title 3.df' : 'Title /gdc/md/storybook/obj/3.df'
    };
}

export function getResultWithTwoMeasures(): ISimpleExecutorResult {
    return {
        isLoaded: true,
        headers: [
            HEADER_MEASURE_1,
            HEADER_MEASURE_2
        ],
        rawData: [
            [
                '54.86307837343727',
                '32.901268944187144'
            ]
        ],
        warnings: [],
        isEmpty: false
    };
}

export function getResultWithOneMeasuresAndOneAttribute(withIdentifiers: boolean = false)
    : ISimpleExecutorResult {

    return {
        isLoaded: true,
        headers: [
            getHeaderAttribute(withIdentifiers),
            HEADER_MEASURE_1
        ],
        rawData: [
            [
                {
                    id: '1',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 0`
                },
                '24.47418736303053'
            ],
            [
                {
                    id: '2',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 1`
                },
                '46.31826904724989'
            ],
            [
                {
                    id: '3',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 2`
                },
                '63.306397981244714'
            ]
        ],
        warnings: [],
        isEmpty: false
    };
}

export function getResultWithTwoMeasuresAndOneAttribute(withIdentifiers: boolean = false)
    : ISimpleExecutorResult {

    return {
        isLoaded: true,
        headers: [
            getHeaderAttribute(withIdentifiers),
            HEADER_MEASURE_1,
            HEADER_MEASURE_2
        ],
        rawData: [
            [
                {
                    id: '1',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 0`
                },
                '22.61219185361125',
                '42.15221061488796'
            ],
            [
                {
                    id: '2',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 1`
                },
                '17.95269276702105',
                '66.77392105963627'
            ],
            [
                {
                    id: '3',
                    name: `Element ${getHeaderAttribute(withIdentifiers).id} 2`
                },
                '14.285548411842397',
                '22.993364919295157'
            ]
        ],
        warnings: [],
        isEmpty: false
    };
}
