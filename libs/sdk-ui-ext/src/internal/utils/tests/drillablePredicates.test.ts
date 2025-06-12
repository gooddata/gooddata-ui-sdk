// (C) 2019-2020 GoodData Corporation
import { convertPostMessageToDrillablePredicates } from "../drillablePredicates.js";
import { describe, it, expect, vi, SpyInstance, beforeEach, afterEach } from "vitest";
import { IHeaderPredicate, HeaderPredicates } from "@gooddata/sdk-ui";
import { IDrillableItemsCommandBody } from "@gooddata/sdk-embedding";

describe("convertPostMessageToDrillablePredicates", () => {
    let uriMatchSpy: SpyInstance;
    let identifierMatchSpy: SpyInstance;
    let composedFromUriSpy: SpyInstance;
    let composedFromIdentifierSpy: SpyInstance;

    function assertPredicates(result: IHeaderPredicate[], expectedCount: number) {
        expect(result).toHaveLength(expectedCount);
        result.forEach((predicate) => {
            expect(typeof predicate).toBe("function");
        });
    }

    beforeEach(() => {
        uriMatchSpy = vi.spyOn(HeaderPredicates, "uriMatch");
        identifierMatchSpy = vi.spyOn(HeaderPredicates, "identifierMatch");
        composedFromUriSpy = vi.spyOn(HeaderPredicates, "composedFromUri");
        composedFromIdentifierSpy = vi.spyOn(HeaderPredicates, "composedFromIdentifier");
    });

    afterEach(() => {
        uriMatchSpy.mockRestore();
        identifierMatchSpy.mockRestore();
        composedFromUriSpy.mockRestore();
        composedFromIdentifierSpy.mockRestore();
    });

    it("should return predicates for combination of uris and identifiers", async () => {
        const data: IDrillableItemsCommandBody = {
            uris: ["/foo", "/measure"],
            identifiers: ["bar", "baz"],
        };

        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 4);

        expect(uriMatchSpy).toHaveBeenCalledTimes(2);
        expect(uriMatchSpy).toBeCalledWith("/foo");
        expect(uriMatchSpy).toBeCalledWith("/measure");

        expect(identifierMatchSpy).toHaveBeenCalledTimes(2);
        expect(identifierMatchSpy).toBeCalledWith("bar");
        expect(identifierMatchSpy).toBeCalledWith("baz");
    });

    it("should return deduplicated predicates", async () => {
        const data: IDrillableItemsCommandBody = {
            uris: ["/common", "/common"],
            identifiers: ["common", "common"],
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 2);

        expect(uriMatchSpy).toHaveBeenCalledTimes(1);
        expect(uriMatchSpy).toBeCalledWith("/common");
        expect(identifierMatchSpy).toHaveBeenCalledTimes(1);
        expect(identifierMatchSpy).toBeCalledWith("common");
    });

    it("should return no predicates when no identifiers and uris provided", async () => {
        const data: IDrillableItemsCommandBody = {
            uris: [],
            identifiers: [],
        };
        const result = await convertPostMessageToDrillablePredicates(data);

        assertPredicates(result, 0);
    });

    it("should return uriMatch predicate when only uris list provided", async () => {
        const data = {
            uris: ["/foo"],
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(1);
        expect(uriMatchSpy).toBeCalledWith("/foo");
    });

    it("should return identifierMatch predicate when only identifiers list provided", async () => {
        const data = {
            identifiers: ["bar"],
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 1);

        expect(identifierMatchSpy).toHaveBeenCalledTimes(1);
        expect(identifierMatchSpy).toBeCalledWith("bar");
    });

    it("should return composedFromUri predicates when composed uri provided", async () => {
        const data: IDrillableItemsCommandBody = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo", "/bar"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 2);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/bar");
    });

    it("should return composedFromUri predicate even when composed unresolvable uri provided", async () => {
        const data: IDrillableItemsCommandBody = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/undefinedUri"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(1);
        expect(composedFromUriSpy).toBeCalledWith("/undefinedUri");
    });

    it("should return composedFromIdentifier predicates when composed identifiers provided", async () => {
        const data: IDrillableItemsCommandBody = {
            identifiers: [],
            uris: [],
            composedFrom: {
                identifiers: ["bar", "baz"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 2);

        expect(composedFromIdentifierSpy).toHaveBeenCalledTimes(2);
        expect(composedFromIdentifierSpy).toBeCalledWith("bar");
        expect(composedFromIdentifierSpy).toBeCalledWith("baz");
    });

    it("should return predicates when composed uri and identifiers provided", async () => {
        const data: IDrillableItemsCommandBody = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo"],
                identifiers: ["bar"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 2);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(1);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromIdentifierSpy).toHaveBeenCalledTimes(1);
        expect(composedFromIdentifierSpy).toBeCalledWith("bar");
    });

    it("should return deduplicated predicates when composed uris and identifiers provided", async () => {
        const data: IDrillableItemsCommandBody = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo", "/common", "/common"],
                identifiers: ["bar", "common", "common"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 4);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/common");
        expect(composedFromIdentifierSpy).toHaveBeenCalledTimes(2);
        expect(composedFromIdentifierSpy).toBeCalledWith("bar");
        expect(composedFromIdentifierSpy).toBeCalledWith("common");
    });

    it("should return deduplicated predicates when all input uris and identifiers provided", async () => {
        const data: IDrillableItemsCommandBody = {
            uris: ["/foo", "/common", "/common"],
            identifiers: ["bar", "baz", "common", "common"],
            composedFrom: {
                uris: ["/foo", "/common", "/common"],
                identifiers: ["bar", "baz", "common", "common"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates(data);
        assertPredicates(result, 10);

        expect(uriMatchSpy).toHaveBeenCalledTimes(2);
        expect(uriMatchSpy).toBeCalledWith("/foo");
        expect(uriMatchSpy).toBeCalledWith("/common");

        expect(identifierMatchSpy).toHaveBeenCalledTimes(3);
        expect(identifierMatchSpy).toBeCalledWith("bar");
        expect(identifierMatchSpy).toBeCalledWith("baz");
        expect(identifierMatchSpy).toBeCalledWith("common");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/common");

        expect(composedFromIdentifierSpy).toHaveBeenCalledTimes(3);
        expect(composedFromIdentifierSpy).toBeCalledWith("bar");
        expect(composedFromIdentifierSpy).toBeCalledWith("baz");
        expect(composedFromIdentifierSpy).toBeCalledWith("common");
    });
});
