// (C) 2020 GoodData Corporation

import { BearExecution } from "../executionFactory";
import { BearAuthenticatedCallGuard } from "../../../../types/auth";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedInsight } from "@gooddata/sdk-backend-mockingbird";
import { newAttributeSort } from "@gooddata/sdk-model";
import { withCaching } from "@gooddata/sdk-backend-base";
import bearFactory from "../../../../index";

const UnsupportedAuthCall: BearAuthenticatedCallGuard = () => {
    throw new NotSupported("you got too far");
};

const TestInsight = recordedInsight(ReferenceRecordings.Insights.BarChart.SingleMeasureWithViewBy);
const TestExtraSort = newAttributeSort(ReferenceMd.Product.Name);

describe("execution factory", () => {
    it("should retain execute-by-ref implementation", () => {
        const factory = new BearExecution(UnsupportedAuthCall, "test-workspace");
        const initialExecution = factory.forInsightByRef(TestInsight);
        const withExtraConfiguration = initialExecution.withSorting(TestExtraSort);

        expect(initialExecution.constructor.name).toEqual(withExtraConfiguration.constructor.name);
    });

    it("should work with decorators", () => {
        /*
         * This is here to confirm that the shenanigans related to execute-by-ref play well with the decorators
         */
        const cachingBackend = withCaching(bearFactory());
        const initialExecution = cachingBackend
            .workspace("test-workspace")
            .execution()
            .forInsightByRef(TestInsight);
        const withExtraConfiguration = initialExecution.withSorting(TestExtraSort);

        expect(initialExecution.constructor.name).toEqual(withExtraConfiguration.constructor.name);
    });
});
