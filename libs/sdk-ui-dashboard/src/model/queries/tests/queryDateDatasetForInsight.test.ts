// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import { EmptyDashboardIdentifier } from "../../tests/Dashboard.fixtures";
import { DateDatasetsForInsight, queryDateDatasetsForInsight } from "../queryDateDatasetForInsight";
import { idRef } from "@gooddata/sdk-model";

describe("query date dataset for insight", () => {
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier, undefined));

    it("should create query cache in state", () => {
        expect(Tester.state()._queryCache["GDC.DASH/QUERY.INSIGHT.DATE.DATASETS"]).toBeDefined();
    });

    it("should do work when query action is dispatched", async () => {
        const result = await Tester.query<DateDatasetsForInsight>(
            queryDateDatasetsForInsight(idRef("blabla")),
        );

        expect(result.data).toEqual("some dummy data");
        expect(Tester.state()._queryCache["GDC.DASH/QUERY.INSIGHT.DATE.DATASETS"]).toMatchInlineSnapshot(`
            Object {
              "entities": Object {
                "{\\"identifier\\":\\"blabla\\"}": Object {
                  "query": Object {
                    "payload": Object {
                      "insightRef": Object {
                        "identifier": "blabla",
                      },
                    },
                    "type": "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
                  },
                  "result": Object {
                    "data": "some dummy data",
                  },
                },
              },
              "ids": Array [
                "{\\"identifier\\":\\"blabla\\"}",
              ],
            }
        `);
    });
});
