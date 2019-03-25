// (C) 2007-2019 GoodData Corporation
import { AFM, ExecuteAFM } from '@gooddata/typings';

export const relativeDate: AFM.IRelativeDateFilter = {
    relativeDateFilter: {
        dataSet: { identifier: 'foo' },
        granularity: 'something',
        from: -10,
        to: 0
    }
};

export const absoluteDate: AFM.IAbsoluteDateFilter = {
    absoluteDateFilter: {
        dataSet: { identifier: 'foo' },
        from: '12/12/2012',
        to: '22/12/2012'
    }
};

export const positiveUri: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: 'foo' },
        in: [ 'uri1', 'uri2' ]
    }
};

export const positiveValue: AFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: 'foo' },
        in: [ 'val1', 'val2' ],
        textFilter: true
    }
};

export const positiveUriExpected: ExecuteAFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: 'foo' },
        in: { uris: [ 'uri1', 'uri2' ] }
    }
};

export const positiveValueExpected: ExecuteAFM.IPositiveAttributeFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: 'foo' },
        in: { values: [ 'val1', 'val2' ] }
    }
};

export const negativeUri: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: 'foo' },
        notIn: [ 'uri1', 'uri2' ]
    }
};

export const negativeValue: AFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: 'foo' },
        notIn: [ 'val1', 'val2' ],
        textFilter: true
    }
};

export const negativeUriExpected: ExecuteAFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: 'foo' },
        notIn: { uris: [ 'uri1', 'uri2' ] }
    }
};

export const negativeValueExpected: ExecuteAFM.INegativeAttributeFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: 'foo' },
        notIn: { values: [ 'val1', 'val2' ] }
    }
};
