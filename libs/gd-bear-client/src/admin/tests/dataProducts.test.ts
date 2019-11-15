// (C) 2007-2014 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { DataProductsModule } from "../dataProducts";
import { ApiResponse, XhrModule } from "../../xhr";

const createDataProductsModule = () => new DataProductsModule(new XhrModule(fetch, {}));

describe("dataProducts", () => {
    describe("with fake server", () => {
        describe("getDataProduct", () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/admin/contracts/contractId/dataproducts/dataProductId?", 400);

                return createDataProductsModule()
                    .getDataProduct("contractId", "dataProductId", "", "", null)
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return dataproduct", () => {
                fetchMock.mock("/gdc/admin/contracts/contractId/dataproducts/dataproductId?", {
                    status: 200,
                    body: JSON.stringify({
                        dataProduct: {
                            id: "dataproductId",
                            domains: [
                                {
                                    name: "data-admin-test1",
                                    environment: "TEST",
                                },
                            ],
                            links: {
                                domains: ["/gdc/admin/contracts/contractId/domains/data-admin-test1"],
                                domainDataProducts: [
                                    "/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId",
                                ], // tslint:disable-line:max-line-length
                                domainSegments: [
                                    "/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId/segments",
                                ], // tslint:disable-line:max-line-length
                                segments: [
                                    "/gdc/admin/contracts/contractId/dataproducts/dataproductid/segments",
                                ],
                                self: "/gdc/admin/contracts/contractId/dataproducts/",
                            },
                        },
                    }),
                });
                return createDataProductsModule()
                    .getDataProduct("contractId", "dataproductId", "", "", null)
                    .then((result: any) => {
                        expect(result.domains[0].name).toBe("data-admin-test1");
                        expect(result.domains[0].environment).toBe("TEST");

                        expect(result.id).toBe("dataproductId");
                        expect(result.contractId).toBe("contractId");
                    });
            });

            it("should return dataproducts", () => {
                fetchMock.mock("/gdc/admin/contracts/contractId/dataproducts", {
                    status: 200,
                    body: JSON.stringify({
                        dataProducts: {
                            items: [
                                {
                                    dataProduct: {
                                        id: "dataproductId",
                                        domains: [
                                            {
                                                name: "data-admin-test1",
                                                environment: "TEST",
                                            },
                                        ],
                                        links: {
                                            domains: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test1",
                                            ],
                                            domainDataProducts: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId",
                                            ], // tslint:disable-line:max-line-length
                                            domainSegments: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId/segments",
                                            ], // tslint:disable-line:max-line-length
                                            segments: [
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductid/segments",
                                            ], // tslint:disable-line:max-line-length
                                            self:
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductId",
                                        },
                                    },
                                },
                                {
                                    dataProduct: {
                                        id: "dataproductId1",
                                        domains: [
                                            {
                                                name: "data-admin-test2",
                                                environment: "TEST",
                                            },
                                        ],
                                        links: {
                                            domains: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test2",
                                            ],
                                            domainDataProducts: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test1/dataproducts/dataproductId1",
                                            ], // tslint:disable-line:max-line-length
                                            domainSegments: [
                                                "/gdc/admin/contracts/contractId/domains/data-admin-test2/dataproducts/dataproductId1/segments",
                                            ], // tslint:disable-line:max-line-length
                                            segments: [
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductId1/segments",
                                            ], // tslint:disable-line:max-line-length
                                            self:
                                                "/gdc/admin/contracts/contractId/dataproducts/dataproductId1",
                                        },
                                    },
                                },
                            ],
                        },
                    }),
                });
                return createDataProductsModule()
                    .getDataProducts("contractId", "")
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].domains[0].name).toBe("data-admin-test1");
                        expect(result.items[0].domains[0].environment).toBe("TEST");
                        expect(result.items[1].domains[0].name).toBe("data-admin-test2");
                        expect(result.items[1].domains[0].environment).toBe("TEST");

                        expect(result.items[0].id).toBe("dataproductId");
                        expect(result.items[1].id).toBe("dataproductId1");

                        expect(result.items[0].contractId).toBe("contractId");
                        expect(result.items[1].contractId).toBe("contractId");
                    });
            });

            it("should create dataproduct", () => {
                fetchMock.post("/gdc/admin/contracts/contractId/dataproducts", {
                    status: 201,
                    body: JSON.stringify({
                        dataProductCreate: {
                            id: "dataproductId",
                            domains: ["data-admin-test1", "data-admin-test2"],
                        },
                    }),
                });
                return createDataProductsModule()
                    .createDataProduct("contractId", "dataproductId", [
                        "data-admin-test1",
                        "data-admin-test2",
                    ])
                    .then((r: ApiResponse) => r.response)
                    .then((result: any) => {
                        expect(result.status).toBe(201);
                    })
                    .catch((error: any) => console.log(error)); // tslint:disable-line:no-console
            });
        });
    });
});
