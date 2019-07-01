// (C) 2007-2018 GoodData Corporation
const template: any = {
    executionRequest: require("./bar_chart_with_2_metrics_and_view_by_attribute_request.json").execution,
    executionResponse: require("./bar_chart_with_2_metrics_and_view_by_attribute_response.json")
        .executionResponse,
};

const postiveData = [["198", "446", "137", "986", "656"], ["7661", "2233", "1239", "8895", "4258"]];

const negativeData = [
    ["-198", "-446", "-137", "-986", "-656"],
    ["-7661", "-2233", "-1239", "-8895", "-4258"],
];

const oneNegativeSideData = [
    ["198", "446", "137", "986", "656"],
    ["-7661", "-2233", "-1239", "-8895", "-4258"],
];

const leftPositiveRightMixData = [
    ["30744", "20744", "60962", "40978", "10246"],
    ["-30873", "-30873", "1069127", "-41164", "-10291"],
];

const mixData01 = [["-198", "446", "-137", "986", "-656"], ["7661", "-2233", "1239", "-8895", "4258"]];

const mixData02 = [["198", "-446", "137", "-986", "656"], ["-7661", "-2233", "-1239", "-8895", "-4258"]];

const SD160Case01 = [["250744", "-40914", "2225030", "51180"], ["30816", "140816", "41102", "-51280"]];

const SD160Case02 = [["250744", "-4091400", "3341006", "51180"], ["30816", "140816", "41102", "-51280"]];

// tslint:disable-next-line
const executionResult = require("./bar_chart_with_2_metrics_and_view_by_attribute_result.json")
    .executionResult;

export const positiveDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: postiveData,
    },
};

export const negativeDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: negativeData,
    },
};

export const oneNegativeSideDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: oneNegativeSideData,
    },
};

export const leftPositiveRightMixDataset: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: leftPositiveRightMixData,
    },
};

export const mixDataset01: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: mixData01,
    },
};

export const mixDataset02: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: mixData02,
    },
};

export const sd160DataSet01: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: SD160Case01,
    },
};

export const sd160DataSet02: any = {
    ...template,
    executionResult: {
        ...executionResult,
        data: SD160Case02,
    },
};
