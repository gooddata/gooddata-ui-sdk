// (C) 2007-2014 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { SegmentsModule } from "../segments";
import { XhrModule } from "../../xhr";

const createSegmentsModule = () => new SegmentsModule(new XhrModule(fetch, {}));

describe("segments", () => {
    describe("with fake server", () => {
        describe("getDataProductSegments", () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/admin/contracts/contractId/dataproducts/dataProductId/segments", 400);

                return createSegmentsModule()
                    .getDataProductSegments("contractId", "dataProductId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return dataproduct segments", () => {
                fetchMock.mock("/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments", {
                    status: 200,
                    body: JSON.stringify({
                        segments: {
                            items: [
                                {
                                    segment: {
                                        id: "segmentId",
                                        domains: ["data-admin-test1", "data-admin-test2"],
                                        links: {
                                            self:
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId", // tslint:disable-line:max-line-length
                                        },
                                    },
                                },
                                {
                                    segment: {
                                        id: "segmentId1",
                                        domains: ["data-admin-test1", "data-admin-test2"],
                                        links: {
                                            self:
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId1", // tslint:disable-line:max-line-length
                                        },
                                    },
                                },
                            ],
                        },
                    }),
                });
                return createSegmentsModule()
                    .getDataProductSegments("contractId", "dataproductId")
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].domains[0]).toBe("data-admin-test1");
                        expect(result.items[0].domains[1]).toBe("data-admin-test2");
                        expect(result.items[1].domains[0]).toBe("data-admin-test1");
                        expect(result.items[1].domains[1]).toBe("data-admin-test2");

                        expect(result.items[0].id).toBe("segmentId");
                        expect(result.items[1].id).toBe("segmentId1");
                    });
            });

            it("should create dataproduct", () => {
                fetchMock.post("/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments", {
                    status: 201,
                    body: JSON.stringify({
                        segmentCreate: {
                            id: "segmentId",
                            title: "segmentId",
                            domains: [
                                "/gdc/admin/contracts/contractId/domains/data-admin-test1",
                                "/gdc/admin/contracts/contractId/domains/data-admin-test2",
                            ],
                        },
                    }),
                });

                return createSegmentsModule()
                    .createSegment("contractId", "dataproductId", "segmentId", [
                        "data-admin-test1",
                        "data-admin-test2",
                    ])
                    .then((result: any) => {
                        expect(result.response.status).toBe(201);
                    });
            });
        });
    });
});
