// (C) 2019 GoodData Corporation
import { IElementQueryResult } from "@gooddata/sdk-backend-spi";

import { mergeElementQueryResults } from "../mergeElementQueryResults";
import { emptyListItem } from "../types";

describe("mergeElementQueryResults", () => {
    it("should handle empty current elements", () => {
        const current: IElementQueryResult | undefined = undefined;

        const incoming: IElementQueryResult = {
            items: [
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
            items: [],
            limit: 1,
            next: jest.fn(),
            offset: 0,
            totalCount: 1,
        };

        const incoming: IElementQueryResult = {
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
            items: [
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
