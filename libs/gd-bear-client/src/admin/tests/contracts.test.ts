// (C) 2007-2014 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { ContractsModule } from "../contracts";
import { XhrModule } from "../../xhr";

const createContractsModule = () => new ContractsModule(new XhrModule(fetch, {}));

describe("contracts", () => {
    describe("with fake server", () => {
        describe("getUserContracts", () => {
            const contractsPayload = JSON.stringify({
                contracts: {
                    items: [
                        {
                            contract: {
                                id: "contractId1",
                            },
                        },
                        {
                            contract: {
                                id: "contractId2",
                            },
                        },
                    ],
                    paging: {},
                },
            });

            it("should return users contracts", () => {
                fetchMock.mock("/gdc/admin/contracts", {
                    status: 200,
                    body: contractsPayload,
                });

                return createContractsModule()
                    .getUserContracts()
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].id).toBe("contractId1");
                        expect(result.items[1].id).toBe("contractId2");
                    });
            });
        });
    });
});
