// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../tests/DashboardTester";
import { EmptyDashboardIdentifier, TestCorrelation } from "../../tests/Dashboard.fixtures";
import { idRef } from "@gooddata/sdk-model";
import { DateDatasetsForInsight, queryDateDatasetsForInsight } from "../../queries/insights";
import { createSliceNameForQueryCache } from "../../state/_infra/queryService";

describe("query date dataset for insight", () => {
    const cacheName = createSliceNameForQueryCache("GDC.DASH/QUERY.INSIGHT.DATE.DATASETS");
    let Tester: DashboardTester;
    beforeEach(preloadedTesterFactory((tester) => (Tester = tester), EmptyDashboardIdentifier, undefined));

    it("should create query cache in state", () => {
        expect(Tester.state()._queryCache[cacheName]).toBeDefined();
    });

    it("should do work when query action is dispatched", async () => {
        const result = await Tester.query<DateDatasetsForInsight>(
            queryDateDatasetsForInsight(idRef("blabla")),
        );

        expect(result.data).toEqual("some dummy data");
        expect(Tester.state()._queryCache[cacheName]).toMatchSnapshot();
    });

    it("should emit the right events", async () => {
        await Tester.query<DateDatasetsForInsight>(
            queryDateDatasetsForInsight(idRef("blabla"), TestCorrelation),
        );

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
