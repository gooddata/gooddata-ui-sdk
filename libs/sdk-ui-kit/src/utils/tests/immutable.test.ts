// (C) 2007-2020 GoodData Corporation
import { fromJS } from "immutable";

import { propsEqual } from "../immutable";

interface IProps {
    prop1: {
        prop: boolean;
    };
    prop2: [
        {
            prop3?: string;
            prop4?: string;
        },
    ];
}

const propsA: IProps = {
    prop1: { prop: true },
    prop2: [{ prop3: "abc" }],
};

const propsB: IProps = {
    prop1: { prop: true },
    prop2: [{ prop3: "abc" }],
};

const propsC: IProps = {
    prop1: { prop: false },
    prop2: [{ prop4: "def" }],
};

const prop1 = fromJS({ prop: true });
const prop2 = fromJS([{ prop: "abc" }]);

const propsD = { prop1, prop2 };
const propsE = { prop1, prop2 };
const propsF = {
    prop1: fromJS({ prop: true }),
    prop2: fromJS([{ prop: "abc" }]),
};

describe("immutable", () => {
    describe("propsEqual", () => {
        it.each([
            [true, propsA, propsB],
            [false, propsA, propsC],
        ])("should find deep-compared non-immutable props equality to be %s", (expected, props1, props2) => {
            expect(propsEqual<IProps>(props1, props2)).toEqual(expected);
        });

        it.each([
            [true, propsD, propsE],
            [false, propsD, propsF],
        ])("should find shallow-compared immutable props equality to be %s", (expected, props1, props2) => {
            expect(propsEqual(props1, props2)).toEqual(expected);
        });
    });
});
