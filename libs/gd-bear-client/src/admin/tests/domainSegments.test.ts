// (C) 2007-2014 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { DomainSegmentsModule } from "../domainSegments";
import { XhrModule } from "../../xhr";

const createDomainSegmentsModule = () => new DomainSegmentsModule(new XhrModule(fetch, {}));

describe("domainSegments", () => {
    describe("with fake server", () => {
        describe("getDomainSegments", () => {
            afterEach(() => {
                fetchMock.restore();
            });

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock(
                    "/gdc/admin/contracts/contractId/dataproducts/dataProductId/segments/segmentId/domainsegments/",
                    400,
                );

                return createDomainSegmentsModule()
                    .getDomainSegment("contractId", "dataProductId", "segmentId", "", "")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return domain segment", () => {
                fetchMock.mock(
                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1", // tslint:disable-line:max-line-length
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainSegment: {
                                id: "domainSegmentId",
                                domain: "data-admin-test1",
                                masterProject: {
                                    project: {
                                        id: "projectId",
                                        title: "master",
                                        projectToken: "projectToken",
                                        links: {
                                            publicUri: "publicUri",
                                        },
                                        state: "ENABLED",
                                    },
                                },
                                links: {
                                    self:
                                        "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1", // tslint:disable-line:max-line-length
                                },
                            },
                        }),
                    },
                );
                return createDomainSegmentsModule()
                    .getDomainSegment("contractId", "dataproductId", "segmentId", "data-admin-test1", "")
                    .then((result: any) => {
                        expect(result.domain).toBe("data-admin-test1");
                        expect(result.id).toBe("domainSegmentId");
                        expect(result.masterProject.project.id).toBe("projectId");
                        expect(result.masterProject.project.title).toBe("master");
                        expect(result.masterProject.project.projectToken).toBe("projectToken");
                        expect(result.masterProject.project.links.publicUri).toBe("publicUri");
                    });
            });

            it("should return domain segments", () => {
                fetchMock.mock(
                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments",
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainSegments: {
                                items: [
                                    {
                                        domainSegment: {
                                            id: "segmentId",
                                            domain: "data-admin-test1",
                                            masterProject: {
                                                project: {
                                                    id: "projectId",
                                                    title: "master",
                                                    projectToken: "projectToken",
                                                    links: {
                                                        publicUri: "publicUri",
                                                    },
                                                    state: "ENABLED",
                                                },
                                            },
                                            links: {
                                                self:
                                                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId/domainsegments/data-admin-test1", // tslint:disable-line:max-line-length
                                            },
                                        },
                                    },
                                    {
                                        domainSegment: {
                                            id: "segmentId1",
                                            domain: "data-admin-test2",
                                            masterProject: {
                                                project: {
                                                    id: "projectId1",
                                                    title: "master",
                                                    projectToken: "projectToken",
                                                    links: {
                                                        publicUri: "publicUri",
                                                    },
                                                    state: "ENABLED",
                                                },
                                            },
                                            links: {
                                                self:
                                                    "/gdc/admin/contracts/contractId/dataproducts/dataproductId/segments/segmentId1/domainsegments/data-admin-test2", // tslint:disable-line:max-line-length
                                            },
                                        },
                                    },
                                ],
                            },
                        }),
                    },
                );
                return createDomainSegmentsModule()
                    .getDomainSegments("contractId", "dataproductId", "segmentId", "")
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);

                        expect(result.items[0].domain).toBe("data-admin-test1");
                        expect(result.items[0].id).toBe("segmentId");
                        expect(result.items[0].masterProject.project.id).toBe("projectId");
                        expect(result.items[0].masterProject.project.title).toBe("master");
                        expect(result.items[0].masterProject.project.projectToken).toBe("projectToken");
                        expect(result.items[0].masterProject.project.links.publicUri).toBe("publicUri");

                        expect(result.items[1].domain).toBe("data-admin-test2");
                        expect(result.items[1].id).toBe("segmentId1");
                        expect(result.items[1].masterProject.project.id).toBe("projectId1");
                        expect(result.items[1].masterProject.project.title).toBe("master");
                        expect(result.items[1].masterProject.project.projectToken).toBe("projectToken");
                        expect(result.items[1].masterProject.project.links.publicUri).toBe("publicUri");
                    });
            });
        });
    });
});
