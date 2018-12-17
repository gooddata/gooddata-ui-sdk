// (C) 2007-2018 GoodData Corporation
const template: any = {
    executionRequest: require('./bar_chart_with_2_metrics_and_view_by_attribute_request.json').execution,
    executionResponse:
        require('./bar_chart_with_2_metrics_and_view_by_attribute_response.json').executionResponse
};

const postiveData = [
    [
        '198',
        '446',
        '137',
        '986',
        '656'
    ],
    [
        '7661',
        '2233',
        '1239',
        '8895',
        '4258'
    ]
];

const negativeData = [
    [
        '-198',
        '-446',
        '-137',
        '-986',
        '-656'
    ],
    [
        '-7661',
        '-2233',
        '-1239',
        '-8895',
        '-4258'
    ]
];

const oneNegativeSideData = [
    [
        '198',
        '446',
        '137',
        '986',
        '656'
    ],
    [
        '-7661',
        '-2233',
        '-1239',
        '-8895',
        '-4258'
    ]
];

const mixData01 = [
    [
        '-198',
        '446',
        '-137',
        '986',
        '-656'
    ],
    [
        '7661',
        '-2233',
        '1239',
        '-8895',
        '4258'
    ]
];

const mixData02 = [
    [
        '198',
        '-446',
        '137',
        '-986',
        '656'
    ],
    [
        '-7661',
        '-2233',
        '-1239',
        '-8895',
        '-4258'
    ]
];

// tslint:disable-next-line
const executionResult = require('./bar_chart_with_2_metrics_and_view_by_attribute_result.json').executionResult;

export const positiveDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: postiveData
    }
};

export const negativeDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: negativeData
    }
};

export const oneNegativeSideDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: oneNegativeSideData
    }
};

export const mixDataset01: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: mixData01
    }
};

export const mixDataset02: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: mixData02
    }
};
