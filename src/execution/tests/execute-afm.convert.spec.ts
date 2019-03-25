// (C) 2007-2019 GoodData Corporation

import { convertAfm } from '../execute-afm.convert';
import * as input from './fixtures';

const FILTER_TESTS = [
    ['leave empty filters as is', [], []],
    ['leave relative date filter as is', [ input.relativeDate ], [ input.relativeDate ]],
    ['leave absolute date filter as is', [ input.absoluteDate ], [ input.absoluteDate ]],
    ['convert positive URI filter', [ input.positiveUri ], [ input.positiveUriExpected ] ],
    ['convert positive value filter', [ input.positiveValue ], [ input.positiveValueExpected ] ],
    ['convert negative URI filter', [ input.negativeUri ], [ input.negativeUriExpected ] ],
    ['convert negative value filter', [ input.negativeValue ], [ input.negativeValueExpected ] ],
    ['convert mix of URI and value filters',
        [ input.positiveUri, input.negativeValue ], [ input.positiveUriExpected, input.negativeValueExpected ] ],
    ['convert mix of date and attribute filters',
        [ input.absoluteDate, input.positiveUri, input.relativeDate, input.negativeValue ],
        [ input.absoluteDate, input.positiveUriExpected, input.relativeDate, input.negativeValueExpected ] ]
];

describe.each(FILTER_TESTS)('convertAfm', (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertAfm({ filters: input })).toEqual({ filters: expected });
    });
});
