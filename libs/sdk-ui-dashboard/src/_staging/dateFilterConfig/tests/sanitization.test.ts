// (C) 2019-2022 GoodData Corporation
import { IAbsoluteDateFilterForm } from "@gooddata/sdk-model";
import { IUiAbsoluteDateFilterForm, IUiRelativeDateFilterForm } from "@gooddata/sdk-ui-filters";

import { sanitizeDateFilterOption } from "../sanitization";

describe("sanitizeDateFilterOption", () => {
    type TestCaseCollection<T> = Array<[string, T, T]>;

    describe("absolute option sanitization", () => {
        const absoluteFormBase: IAbsoluteDateFilterForm = {
            localIdentifier: "FOO",
            name: "Foo",
            type: "absoluteForm",
            visible: true,
        };

        const absoluteFormCases: TestCaseCollection<IUiAbsoluteDateFilterForm> = [
            [
                "ordered bounds",
                { ...absoluteFormBase, from: "2019-01-01", to: "2019-01-31" },
                { ...absoluteFormBase, from: "2019-01-01", to: "2019-01-31" },
            ],
            [
                "equal bounds",
                { ...absoluteFormBase, from: "2019-01-01", to: "2019-01-01" },
                { ...absoluteFormBase, from: "2019-01-01", to: "2019-01-01" },
            ],
            [
                "unordered bounds",
                { ...absoluteFormBase, from: "2019-01-31", to: "2019-01-01" },
                { ...absoluteFormBase, from: "2019-01-01", to: "2019-01-31" },
            ],
        ];

        it.each(absoluteFormCases)("should sanitize absolute form with %s", (_, input, expected) => {
            expect(sanitizeDateFilterOption(input)).toEqual(expected);
        });
    });

    describe("relative option sanitization", () => {
        const relativeFormBase: IUiRelativeDateFilterForm = {
            localIdentifier: "FOO",
            name: "Foo",
            type: "relativeForm",
            granularity: "GDC.time.date",
            visible: true,
        };

        const relativeFormCases: TestCaseCollection<IUiRelativeDateFilterForm> = [
            [
                "ordered bounds",
                { ...relativeFormBase, from: 5, to: 10 },
                { ...relativeFormBase, from: 5, to: 10 },
            ],
            [
                "equal bounds",
                { ...relativeFormBase, from: 5, to: 5 },
                { ...relativeFormBase, from: 5, to: 5 },
            ],
            [
                "unordered bounds",
                { ...relativeFormBase, from: 10, to: 5 },
                { ...relativeFormBase, from: 5, to: 10 },
            ],
        ];

        it.each(relativeFormCases)("should sanitize relative form with %s", (_, input, expected) => {
            expect(sanitizeDateFilterOption(input)).toEqual(expected);
        });
    });
});
