// (C) 2019 GoodData Corporation
import sdk from "@gooddata/gooddata-js";
import { IPostMessageData, convertPostMessageToDrillablePredicates } from "../drillablePredicates";
import SpyInstance = jest.SpyInstance;
import Mock = jest.Mock;
import { IHeaderPredicate } from "../../../interfaces/HeaderPredicate";
import * as HeaderPredicateFactory from "../../../factory/HeaderPredicateFactory";

describe("convertPostMessageToDrillablePredicates", () => {
    let uriMatchSpy: SpyInstance;
    let composedFromUriSpy: SpyInstance;
    let getUrisFromIdentifiersMock: Mock;

    function checkResult(result: IHeaderPredicate[], responsesCount: number) {
        expect(result).toHaveLength(responsesCount);
        result.forEach(predicate => {
            expect(typeof predicate).toBe("function");
        });
    }

    beforeEach(() => {
        getUrisFromIdentifiersMock = jest
            .spyOn(sdk.md, "getUrisFromIdentifiers")
            .mockImplementation(() =>
                Promise.resolve([
                    { identifier: "bar", uri: "/bar" },
                    { identifier: "baz", uri: "/baz" },
                    { identifier: "common", uri: "/common" },
                ]),
            );
        uriMatchSpy = jest.spyOn(HeaderPredicateFactory, "uriMatch");
        composedFromUriSpy = jest.spyOn(HeaderPredicateFactory, "composedFromUri");
    });

    afterEach(() => {
        getUrisFromIdentifiersMock.mockReset();
        uriMatchSpy.mockRestore();
        composedFromUriSpy.mockRestore();
    });

    it("should return uriMatch predicates for combination of uris and identifiers", async () => {
        const data: IPostMessageData = {
            uris: ["/foo", "/measure"],
            identifiers: ["bar", "baz"],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 4);

        expect(uriMatchSpy).toHaveBeenCalledTimes(4);
        expect(uriMatchSpy).toBeCalledWith("/foo");
        expect(uriMatchSpy).toBeCalledWith("/measure");
        expect(uriMatchSpy).toBeCalledWith("/bar");
        expect(uriMatchSpy).toBeCalledWith("/baz");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return deduplicated uriMatch predicate when uri and identifier refers to same entity", async () => {
        const data: IPostMessageData = {
            uris: ["/common", "/common"],
            identifiers: ["common", "common"],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(1);
        expect(uriMatchSpy).toBeCalledWith("/common");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return no predicates when no identifiers and uris provided", async () => {
        const data: IPostMessageData = {
            uris: [],
            identifiers: [],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 0);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return no predicates when identifier cannot be resolved to uri", async () => {
        const data: IPostMessageData = {
            identifiers: ["undefinedIdentifier"],
            uris: [],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 0);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return uriMatch predicate when only uris list provided", async () => {
        const data = {
            uris: ["/foo"],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(1);
        expect(uriMatchSpy).toBeCalledWith("/foo");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return uriMatch predicate when only identifiers list provided", async () => {
        const data = {
            identifiers: ["bar"],
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(1);
        expect(uriMatchSpy).toBeCalledWith("/bar");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return composedFromUri predicates when composed uri provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo", "/bar"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 2);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/bar");
    });

    it("should return composedFromUri predicate even when composed unresolvable uri provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/undefinedUri"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 1);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(1);
        expect(composedFromUriSpy).toBeCalledWith("/undefinedUri");
    });

    it("should return composedFromUri predicates when composed identifiers provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                identifiers: ["bar", "baz"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 2);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/bar");
        expect(composedFromUriSpy).toBeCalledWith("/baz");
    });

    it("should return no composedFromUri predicates when composed unresolvable identifier provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                identifiers: ["undefinedIdentifier"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 0);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(0);
    });

    it("should return composedFromUri predicates when composed uri and identifiers provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo"],
                identifiers: ["bar"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 2);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(2);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/bar");
    });

    // tslint:disable-next-line:max-line-length
    it("should return deduplicated composedFromUri predicates when composed uris and identifiers provided", async () => {
        const data: IPostMessageData = {
            identifiers: [],
            uris: [],
            composedFrom: {
                uris: ["/foo", "/common"],
                identifiers: ["bar", "common"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 3);

        expect(uriMatchSpy).toHaveBeenCalledTimes(0);

        expect(composedFromUriSpy).toHaveBeenCalledTimes(3);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/common");
        expect(composedFromUriSpy).toBeCalledWith("/bar");
    });

    it("should return deduplicated predicates when all input uris and identifiers provided", async () => {
        const data: IPostMessageData = {
            uris: ["/foo", "/common"],
            identifiers: ["bar", "baz", "common"],
            composedFrom: {
                uris: ["/foo", "/common"],
                identifiers: ["bar", "baz", "common"],
            },
        };
        const result = await convertPostMessageToDrillablePredicates("projectId", data);
        checkResult(result, 8);

        expect(uriMatchSpy).toHaveBeenCalledTimes(4);
        expect(uriMatchSpy).toBeCalledWith("/foo");
        expect(uriMatchSpy).toBeCalledWith("/common");
        expect(uriMatchSpy).toBeCalledWith("/bar");
        expect(uriMatchSpy).toBeCalledWith("/baz");

        expect(composedFromUriSpy).toHaveBeenCalledTimes(4);
        expect(composedFromUriSpy).toBeCalledWith("/foo");
        expect(composedFromUriSpy).toBeCalledWith("/common");
        expect(composedFromUriSpy).toBeCalledWith("/bar");
        expect(composedFromUriSpy).toBeCalledWith("/baz");
    });
});
