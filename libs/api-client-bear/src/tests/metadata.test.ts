// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import { GdcMetadata } from "@gooddata/api-model-bear";
import fetchMock from "fetch-mock";

import range from "lodash/range";
import find from "lodash/find";
import { mockPollingRequest } from "./utils/polling";
import { MetadataModule } from "../metadata";
import { XhrModule } from "../xhr";
import * as fixtures from "./metadata.fixtures";
import { SortDirection } from "../interfaces";
import { mockLocalStorageModule } from "./mockLocalStorageModule";

const createMd = () => new MetadataModule(new XhrModule(fetch, {}, mockLocalStorageModule));

describe("metadata", () => {
    describe("with fake server", () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe("getObjectsByQuery", () => {
            it("should reject with 400 from backend and not use default limit", () => {
                fetchMock.mock(
                    "/gdc/md/myFakeProjectId/objects/query?category=analyticalDashboard&limit=5",
                    400,
                );

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getObjectsByQuery("myFakeProjectId", { category: "analyticalDashboard", limit: 5 })
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries on two pages", () => {
                const body1 = JSON.stringify({
                    objects: {
                        paging: {
                            next: "/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50&offset=50",
                            count: 50,
                            offset: 0,
                        },
                        items: ["item1.1", "item1.2"],
                    },
                });
                fetchMock.mock("/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50", {
                    status: 200,
                    body: body1,
                });

                const body2 = JSON.stringify({
                    objects: {
                        paging: {
                            count: 50,
                            offset: 50,
                        },
                        items: ["item2.1", "item2.2"],
                    },
                });
                fetchMock.mock("/gdc/md/myFakeProjectId/objects/query?category=dataSet&limit=50&offset=50", {
                    status: 200,
                    body: body2,
                });

                return createMd()
                    .getObjectsByQuery("myFakeProjectId", { category: "dataSet" })
                    .then((result: any) => {
                        expect(result.length).toBe(4);
                    });
            });

            it("should create proper url with deprecated parameter", () => {
                const body = JSON.stringify({
                    objects: {
                        paging: {
                            count: 50,
                            offset: 50,
                        },
                        items: [],
                    },
                });

                fetchMock.mock(
                    "/gdc/md/myFakeProjectId/objects/query?category=analyticalDashboard&limit=50&deprecated=1",
                    {
                        status: 200,
                        body,
                    },
                );

                return createMd()
                    .getObjectsByQuery("myFakeProjectId", {
                        category: "analyticalDashboard",
                        deprecated: true,
                    })
                    .then((result: any) => {
                        expect(result.length).toBe(0);
                    });
            });
        });

        describe("getVisualizations", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/visualizationobjects", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getVisualizations("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/visualizationobjects", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{ title: "a1" }, { title: "a2" }] } }),
                });

                return createMd()
                    .getVisualizations("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getAttributes", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/attributes", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getAttributes("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/attributes", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{ title: "a1" }, { title: "a2" }] } }),
                });

                return createMd()
                    .getAttributes("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("createObject", () => {
            it("should return created object", () => {
                const newObj: GdcMetadata.IWrappedMetric = {
                    metric: {
                        content: {
                            expression: "SELECT 1",
                        },
                        meta: {
                            title: "",
                        },
                    },
                };

                fetchMock.mock("/gdc/md/myFakeProjectId/obj?createAndGet=true", {
                    status: 200,
                    body: JSON.stringify({
                        ...newObj,
                    }),
                });

                return createMd()
                    .createObject("myFakeProjectId", newObj)
                    .then((createdObj: any) => {
                        expect(createdObj).toEqual(newObj);
                    });
            });
        });

        describe("etlPull", () => {
            const mockTask = (status: any) => ({
                wTaskStatus: {
                    status,
                },
            });

            const finishedTask = mockTask("OK");
            const runningTask = mockTask("RUNNING");
            const etlUri = "/gdc/md/1/tasks/1/status";
            const triggerEtlResponse = {
                pull2Task: {
                    links: {
                        poll: etlUri,
                    },
                },
            };

            describe("/gdc/md/1/etl/pull2 call successful", () => {
                function mockIntialPost() {
                    fetchMock.post("/gdc/md/1/etl/pull2", {
                        status: 201,
                        body: JSON.stringify(triggerEtlResponse),
                    });
                }

                it("should poll until task status is OK", () => {
                    mockIntialPost();

                    mockPollingRequest(etlUri, runningTask, finishedTask);

                    return createMd()
                        .etlPull("1", "1", { pollStep: 1 })
                        .then((result: any) => {
                            expect(result).toEqual(finishedTask);
                        });
                });
            });

            describe("/gdc/md/1/etl/pull2 call not successful", () => {
                it("should reject if task ends with error", () => {
                    fetchMock.post("/gdc/md/1/etl/pull2", {
                        status: 400,
                        body: JSON.stringify({}),
                    });

                    return createMd()
                        .etlPull("1", "1")
                        .then(
                            () => {
                                throw new Error("Should reject the promise if task ends with error");
                            },
                            (err: any) => {
                                expect(err).toBeInstanceOf(Error);
                            },
                        );
                });
            });
        });

        describe("ldmManage", () => {
            const mockTask = (status: any) => ({
                wTaskStatus: {
                    status,
                },
            });

            const finishedTask = mockTask("OK");
            const runningTask = mockTask("RUNNING");
            const manageStatusUri = "/gdc/md/1/tasks/1/status";
            const triggerLdmManageResponse = {
                entries: [
                    {
                        link: manageStatusUri,
                    },
                ],
            };

            describe("/gdc/md/1/ldm/manage2 call successful", () => {
                function mockIntialPost() {
                    fetchMock.post("/gdc/md/1/ldm/manage2", {
                        status: 200,
                        body: JSON.stringify(triggerLdmManageResponse),
                    });
                }

                it("should poll until task status is OK", () => {
                    mockIntialPost();

                    mockPollingRequest(manageStatusUri, runningTask, finishedTask);

                    return createMd()
                        .ldmManage("1", "1", { pollStep: 1 })
                        .then((result: any) => {
                            expect(result).toEqual(finishedTask);
                        });
                });
            });

            describe("/gdc/md/1/ldm/manage2 call not successful", () => {
                it("should reject if task ends with error", () => {
                    fetchMock.post("/gdc/md/1/ldm/manage2", {
                        status: 400,
                        body: JSON.stringify({}),
                    });

                    return createMd()
                        .ldmManage("1", "1")
                        .then(
                            () => {
                                throw new Error("Should reject the promise if task ends with error");
                            },
                            (err: any) => {
                                expect(err).toBeInstanceOf(Error);
                            },
                        );
                });
            });
        });

        describe("getDimensions", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/dimensions", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getDimensions("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/dimensions", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{ title: "a1" }, { title: "a2" }] } }),
                });

                return createMd()
                    .getDimensions("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getFacts", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/facts", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getFacts("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/facts", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{ title: "a1" }, { title: "a2" }] } }),
                });

                return createMd()
                    .getFacts("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getMetrics", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/metrics", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getMetrics("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/metrics", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{ title: "a1" }, { title: "a2" }] } }),
                });

                return createMd()
                    .getMetrics("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getAvailableMetrics", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/availablemetrics", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getAvailableMetrics("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/availablemetrics", {
                    status: 200,
                    body: JSON.stringify({ entries: [{ link: "m1" }, { link: "m2" }] }),
                });

                return createMd()
                    .getAvailableMetrics("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getAvailableAttributes", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/drillcrosspaths", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getAvailableAttributes("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/drillcrosspaths", {
                    status: 200,
                    body: JSON.stringify({ drillcrosspath: { links: [{ link: "a1" }, { link: "a2" }] } }),
                });

                return createMd()
                    .getAvailableAttributes("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getAvailableFacts", () => {
            it("should reject with 400 from backend", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/availablefacts", 400);

                const okCallback = jest.fn();
                const errorCallback = jest.fn();

                return createMd()
                    .getAvailableFacts("myFakeProjectId")
                    .then(okCallback, errorCallback)
                    .then(() => {
                        expect(okCallback).not.toHaveBeenCalled();
                        expect(errorCallback).toHaveBeenCalled();
                        expect(errorCallback.mock.calls[0][0]).toBeInstanceOf(Error);
                    });
            });

            it("should return correct number of entries", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/availablefacts", {
                    status: 200,
                    body: JSON.stringify({ entries: [{ link: "m1" }, { link: "m2" }] }),
                });

                return createMd()
                    .getAvailableFacts("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getUrisFromIdentifiers", () => {
            it("should return array with identifiers and uris", () => {
                fetchMock.post("/gdc/md/myFakeProjectId/identifiers", {
                    status: 200,
                    body: JSON.stringify({
                        identifiers: [
                            {
                                uri: "/foo/bar",
                                identifier: "attr.foo.bar",
                            },
                            {
                                uri: "/fuzz/buzz",
                                identifier: "attr.fuzz.buzz",
                            },
                        ],
                    }),
                });

                return createMd()
                    .getUrisFromIdentifiers("myFakeProjectId", ["attr.foo.bar"])
                    .then((result: any) => {
                        expect(result).toEqual([
                            {
                                uri: "/foo/bar",
                                identifier: "attr.foo.bar",
                            },
                            {
                                uri: "/fuzz/buzz",
                                identifier: "attr.fuzz.buzz",
                            },
                        ]);
                    });
            });
        });

        describe("getIdentifiersFromUris", () => {
            it("should return array with identifiers and uris", () => {
                fetchMock.post("/gdc/md/myFakeProjectId/identifiers", {
                    status: 200,
                    body: JSON.stringify({
                        identifiers: [
                            {
                                uri: "/foo/bar",
                                identifier: "attr.foo.bar",
                            },
                            {
                                uri: "/fuzz/buzz",
                                identifier: "attr.fuzz.buzz",
                            },
                        ],
                    }),
                });

                return createMd()
                    .getIdentifiersFromUris("myFakeProjectId", ["/foo/bar"])
                    .then((result: any) => {
                        expect(result).toEqual([
                            {
                                uri: "/foo/bar",
                                identifier: "attr.foo.bar",
                            },
                            {
                                uri: "/fuzz/buzz",
                                identifier: "attr.fuzz.buzz",
                            },
                        ]);
                    });
            });
        });

        describe("translateElementLabelsToUris", () => {
            it("should return two label uris", () => {
                fetchMock.post("/gdc/md/myFakeProjectId/labels", {
                    status: 200,
                    body: JSON.stringify(fixtures.elementsLabelsResult),
                });

                return createMd()
                    .translateElementLabelsToUris("myFakeProjectId", "/gdc/md/labelUri", [
                        "2014-01-01",
                        "2016-01-01",
                    ])
                    .then((result: any) => {
                        expect(result).toEqual(fixtures.elementsLabelsResult.elementLabelUri);
                    });
            });
        });

        describe("getObjectUri", () => {
            it("should return uri when identifier exists", () => {
                fetchMock.post("/gdc/md/myFakeProjectId/identifiers", {
                    status: 200,
                    body: JSON.stringify({
                        identifiers: [
                            {
                                uri: "/foo/bar",
                                identifier: "attr.foo.bar",
                            },
                        ],
                    }),
                });

                return createMd()
                    .getObjectUri("myFakeProjectId", "attr.foo.bar")
                    .then((result: any) => {
                        expect(result).toBe("/foo/bar");
                    });
            });

            it("should reject promise when identifier does not exist", () => {
                expect.assertions(1);
                fetchMock.post("/gdc/md/myFakeProjectId/identifiers", {
                    status: 200,
                    body: JSON.stringify({ identifiers: [] }),
                });

                return createMd()
                    .getObjectUri("myFakeProjectId", "foo.bar")
                    .catch((err: any) => {
                        expect(err).toBeInstanceOf(Error);
                    });
            });
        });

        describe("getObjectUsing", () => {
            const projectId = "myFakeProjectId";
            const object = `/gdc/md/${projectId}/obj/1`;
            const types = ["firstType", "secondType"];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const respondEntries = [
                {
                    content: {},
                    meta: {},
                },
            ];

            it("should load object dependencies", () => {
                fetchMock.mock(using2Uri, { status: 200, body: JSON.stringify({ entries: respondEntries }) });

                return createMd()
                    .getObjectUsing(projectId, object, { types })
                    .then((result: any) => {
                        const request = fetchMock.lastOptions(using2Uri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 0,
                            },
                        });

                        expect(result).toEqual(respondEntries);
                    });
            });

            it("should be properly called with nearest when requested", () => {
                fetchMock.mock(using2Uri, { status: 200, body: JSON.stringify({ entries: respondEntries }) });

                const nearest = true;

                return createMd()
                    .getObjectUsing(projectId, object, { types, nearest })
                    .then(() => {
                        const request = fetchMock.lastOptions(using2Uri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            inUse: {
                                uri: object,
                                types,
                                nearest: 1,
                            },
                        });
                    });
            });

            it("should return rejected promise if 400 returned from backend", () => {
                fetchMock.mock(using2Uri, { status: 400, body: JSON.stringify({}) });

                return createMd()
                    .getObjectUsing(projectId, object, { types })
                    .then(() => {
                        throw new Error("Should reject the promise on 400 response");
                    })
                    .catch((err: any) => {
                        expect(err.response.status).toBe(400);
                    });
            });
        });

        describe("getObjectUsingMany", () => {
            const projectId = "myFakeProjectId";
            const object1 = `/gdc/md/${projectId}/obj/1`;
            const object2 = `/gdc/md/${projectId}/obj/2`;
            const objects = [object1, object2];
            const types = ["firstType", "secondType"];
            const using2Uri = `/gdc/md/${projectId}/using2`;

            const response = [
                {
                    entries: [
                        {
                            link: "foo",
                        },
                    ],
                    uri: object1,
                },
                {
                    entries: [
                        {
                            link: "bar",
                        },
                    ],
                    uri: object2,
                },
            ];

            it("should load objects dependencies", () => {
                fetchMock.post(using2Uri, { status: 200, body: JSON.stringify({ useMany: response }) });

                return createMd()
                    .getObjectUsingMany(projectId, objects, { types })
                    .then((result: any) => {
                        const request = fetchMock.lastOptions(using2Uri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 0,
                            },
                        });

                        expect(result).toEqual(response);
                    });
            });

            it("should be properly called with nearest when requested", () => {
                fetchMock.mock(using2Uri, { status: 200, body: JSON.stringify({ useMany: response }) });

                const nearest = true;

                return createMd()
                    .getObjectUsingMany(projectId, objects, { types, nearest })
                    .then(() => {
                        const request = fetchMock.lastOptions(using2Uri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            inUseMany: {
                                uris: objects,
                                types,
                                nearest: 1,
                            },
                        });
                    });
            });

            it("should return rejected promise if 400 returned from backend", () => {
                fetchMock.mock(using2Uri, { status: 400, body: JSON.stringify({}) });

                return createMd()
                    .getObjectUsingMany(projectId, objects, { types })
                    .then(() => {
                        throw new Error("Should reject the promise on 400 response");
                    })
                    .catch((err: any) => {
                        expect(err.response.status).toBe(400);
                    });
            });
        });

        describe("getObjects", () => {
            const generateUrisAndResponse = (projectId: string, num: number) => {
                const uris = range(num).map((i) => `/gdc/md/${projectId}/obj/${i}`);
                const respondEntries = uris.map((uri) => ({
                    content: {},
                    meta: { uri },
                }));

                return { uris, respondEntries };
            };

            const projectId = "myFakeProjectId";
            const getUri = `/gdc/md/${projectId}/objects/get`;

            it("should load elements", () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 2);

                fetchMock.mock(getUri, {
                    status: 200,
                    body: JSON.stringify({ objects: { items: respondEntries } }),
                });

                return createMd()
                    .getObjects(projectId, uris)
                    .then((result: any) => {
                        const request = fetchMock.lastOptions(getUri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            get: {
                                items: uris,
                            },
                        });

                        expect(result).toEqual(respondEntries);
                    });
            });

            it("should load elements chunked", () => {
                const { uris, respondEntries } = generateUrisAndResponse(projectId, 80);

                fetchMock.mock(`/gdc/md/${projectId}/objects/get`, (_, opts: any) => {
                    const requestBody = JSON.parse(opts.body);

                    // respond with only those items which were requested
                    const respondItems = requestBody.get.items.map((itemUri: string) =>
                        find(respondEntries, (responseItem) => responseItem.meta.uri === itemUri),
                    );

                    return {
                        body: JSON.stringify({
                            objects: {
                                items: respondItems,
                            },
                        }),
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    };
                });

                const getCallBody = (index: number) =>
                    JSON.parse((fetchMock.calls(getUri)[index][1] as RequestInit).body!.toString());

                return createMd()
                    .getObjects(projectId, uris)
                    .then((result: any) => {
                        const calls = fetchMock.calls(getUri);

                        expect(calls).toHaveLength(2);

                        expect(getCallBody(0)).toEqual({
                            get: {
                                items: uris.slice(0, 50),
                            },
                        });

                        expect(getCallBody(1)).toEqual({
                            get: {
                                items: uris.slice(50, 80),
                            },
                        });

                        expect(result).toEqual(respondEntries);
                    });
            });

            it("should return rejected promise if 400 returned from backend", () => {
                const { uris } = generateUrisAndResponse(projectId, 5);
                fetchMock.mock(getUri, { status: 400, body: JSON.stringify({}) });

                return createMd()
                    .getObjects(projectId, uris)
                    .then(() => {
                        throw new Error("Should reject the promise on 400 response");
                    })
                    .catch((err: any) => {
                        expect(err.response.status).toBe(400);
                    });
            });
        });

        describe("getValidElements", () => {
            const projectId = "myFakeProjectId";
            const attributeId = "attribute.id";
            const uri = `/gdc/md/${projectId}/obj/${attributeId}/validElements`;
            const convertorUri = `/gdc/app/projects/${projectId}/executeAfm/debug`;

            it("should process params from options", () => {
                const queryString = "?limit=10&offset=5&order=asc&filter=foo&prompt=bar";
                fetchMock.mock(`${uri}${queryString}`, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: [],
                            },
                        }),
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    };
                });

                const options = {
                    limit: 10,
                    offset: 5,
                    order: "asc" as SortDirection,
                    filter: "foo",
                    prompt: "bar",
                    uris: ["foo", "bar"],
                    complement: true,
                    includeTotalCountWithoutFilters: true,
                    restrictiveDefinition: "foo",
                };

                return createMd()
                    .getValidElements(projectId, attributeId, options)
                    .then((result: any) => {
                        const request = fetchMock.lastOptions(`${uri}${queryString}`) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            validElementsRequest: {
                                uris: options.uris,
                                complement: true,
                                includeTotalCountWithoutFilters: true,
                                restrictiveDefinition: "foo",
                            },
                        });

                        expect(result).toEqual({
                            validElements: {
                                items: [],
                            },
                        });
                    });
            });

            it("should strip ? if no params defined", () => {
                fetchMock.mock(uri, () => {
                    return {
                        body: JSON.stringify({
                            validElements: {
                                items: [],
                            },
                        }),
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    };
                });

                const options = {};

                return createMd()
                    .getValidElements(projectId, attributeId, options)
                    .then((result: any) => {
                        const request = fetchMock.lastOptions(uri) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            validElementsRequest: {},
                        });

                        expect(result).toEqual({
                            validElements: {
                                items: [],
                            },
                        });
                    });
            });

            it("should convert afm to report definition", () => {
                const reportDefinitionContent = {
                    chart: {
                        styles: {
                            global: {
                                datalabels: {
                                    displayValues: 1,
                                    fontsize: "auto",
                                    percent: 0,
                                    displayBoxed: 0,
                                    display: "inline",
                                    displayTotals: 1,
                                },
                                colorMapping: [],
                            },
                        },
                        buckets: {
                            detail: [],
                            y: [
                                {
                                    uri: "metric",
                                },
                            ],
                            color: [],
                            marker: [],
                            angle: [],
                            x: [],
                            size: [],
                        },
                        type: "bar",
                    },
                    grid: {
                        sort: {
                            columns: [],
                            rows: [],
                        },
                        columnWidths: [],
                        columns: [],
                        metrics: [
                            {
                                format: "#,##0",
                                alias: "# Employees",
                                uri: "/gdc/md/k26dtejorcqlqf11crn6imbeevp2q4kg/obj/6983",
                            },
                        ],
                        rows: ["metricGroup"],
                    },
                    format: "chart",
                    filters: [],
                    having: [
                        {
                            expression: "[/gdc/md/asl50ejeo8bzp97i9pxlbcm3vkuvzy72/obj/405284] > 60000",
                        },
                    ],
                };

                fetchMock.mock(`${uri}?filter=foo`, {
                    body: {
                        validElements: {
                            items: [],
                        },
                    },
                    status: 200,
                });

                fetchMock.mock(convertorUri, {
                    body: {
                        reportDefinitionWithInlinedMetrics: {
                            content: reportDefinitionContent,
                            links: {
                                explain2: "/gdc/md/k26dtejorcqlqf11crn6imbeevp2q4kg/obj/8777/explain2",
                            },
                            meta: {
                                author: "/gdc/account/profile/f1cc15f9557855cad61d913e734c8c93",
                                uri: "/gdc/md/k26dtejorcqlqf11crn6imbeevp2q4kg/obj/8777",
                                tags: "",
                                created: "2018-03-23 09:35:48",
                                identifier: "aaTgJkpOcku1",
                                deprecated: "0",
                                summary: "",
                                isProduction: 1,
                                title: "Untitled",
                                category: "reportDefinition",
                                updated: "2018-03-23 09:35:48",
                                contributor: "/gdc/account/profile/f1cc15f9557855cad61d913e734c8c93",
                            },
                        },
                    },
                    status: 200,
                });

                const options = {
                    filter: "foo",
                    afm: {
                        measures: [
                            {
                                localIdentifier: "xyz123",
                                definition: {
                                    measure: {
                                        item: {
                                            identifier: "sdfljl",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                };

                return createMd()
                    .getValidElements(projectId, attributeId, options)
                    .then((result) => {
                        const request = fetchMock.lastOptions(`${uri}?filter=foo`) as RequestInit;

                        expect(JSON.parse(request.body!.toString())).toEqual({
                            validElementsRequest: {
                                restrictiveDefinitionContent: reportDefinitionContent,
                            },
                        });

                        expect(result).toEqual({
                            validElements: {
                                items: [],
                            },
                        });
                    });
            });
        });
    });
});
