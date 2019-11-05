// (C) 2019 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

import { mergeElementQueryResults, emptyListItem } from "../mergeElementQueryResults";

describe("mergeElementQueryResults", () => {
    it("should handle empty current elements", () => {
        const current: IElementQueryResult | undefined = undefined;

        const incoming: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const expected = incoming;

        const actual = mergeElementQueryResults(current, incoming);

        expect(actual).toEqual(expected);
    });

    it("should handle appending to empty current elements", () => {
        const current: IElementQueryResult = {
            elements: [],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const incoming: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const expected = incoming;

        const actual = mergeElementQueryResults(current, incoming);

        expect(actual).toEqual(expected);
    });

    it("should handle appending to non-empty current elements without a hole", () => {
        const current: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const incoming: IElementQueryResult = {
            elements: [
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 1,
            totalCount: 2,
        };

        const expected: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: incoming.next,
            offset: 1,
            totalCount: 2,
        };

        const actual = mergeElementQueryResults(current, incoming);

        expect(actual).toEqual(expected);
    });

    it("should handle appending to non-empty current elements with a hole", () => {
        const current: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const incoming: IElementQueryResult = {
            elements: [
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 4,
            totalCount: 5,
        };

        const expected = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
                emptyListItem,
                emptyListItem,
                emptyListItem,
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: incoming.next,
            offset: 4,
            totalCount: 5,
        };

        const actual = mergeElementQueryResults(current, incoming);

        expect(actual).toEqual(expected);
    });

    it("should handle overwriting non-empty current elements", () => {
        const current: IElementQueryResult = {
            elements: [
                {
                    title: "Foo",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const incoming: IElementQueryResult = {
            elements: [
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const expected: IElementQueryResult = {
            elements: [
                {
                    title: "Bar",
                    uri: "some/uri",
                },
            ],
            limit: 1,
            next: incoming.next,
            offset: 0,
            totalCount: 1,
        };

        const actual = mergeElementQueryResults(current, incoming);

        expect(actual).toEqual(expected);
    });
});
