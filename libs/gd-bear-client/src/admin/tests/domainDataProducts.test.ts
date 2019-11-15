// (C) 2007-2014 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { DomainDataProductModule } from "../domainDataProducts";
import { XhrModule } from "../../xhr";

const createDomainDataproductsModule = () => new DomainDataProductModule(new XhrModule(fetch, {}));

describe("domainDataProducts", () => {
    describe("with fake server", () => {
        describe("getDomainDataProducts", () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock(
                    "/gdc/admin/contracts/contractId/dataproducts/dataProductId/domaindataproducts",
                    400,
                );

                return createDomainDataproductsModule()
                    .getDomainDataProducts("contractId", "dataProductId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return domaindataproducts", () => {
                fetchMock.mock(
                    "/gdc/admin/contracts/contractId/dataproducts/dataProductId/domaindataproducts",
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainDataProducts: {
                                items: [
                                    {
                                        domainDataProduct: {
                                            id: "dataproductId",
                                            domain: {
                                                name: "data-admin-test1",
                                                environment: "TEST",
                                            },
                                            links: {
                                                dataProduct:
                                                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId",
                                                domain:
                                                    "/gdc/admin/contracts/contractId/domains/data-admin-test1",
                                                domainSegments: [
                                                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments",
                                                ], // tslint:disable-line:max-line-length
                                                self:
                                                    "gdc/admin/contracts/contractId/dataproducts/dataproductId/domaindataproducts/data-admin-test1", // tslint:disable-line:max-line-length
                                            },
                                        },
                                    },
                                ],
                            },
                        }),
                    },
                );
                return createDomainDataproductsModule()
                    .getDomainDataProducts("contractId", "dataProductId")
                    .then((result: any) => {
                        expect(result.items.length).toBe(1);
                        expect(result.items[0].domain.name).toBe("data-admin-test1");
                        expect(result.items[0].domain.environment).toBe("TEST");

                        expect(result.items[0].id).toBe("dataproductId");
                    });
            });
        });
    });
});
