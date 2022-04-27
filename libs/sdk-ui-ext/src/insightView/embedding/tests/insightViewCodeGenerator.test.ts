// (C) 2022 GoodData Corporation

import { insightViewCodeGenerator } from "../insightViewCodeGenerator";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { insightUri } from "@gooddata/sdk-model";

const INSIGHT_URI = "AreaChart.0229f24b92f336871eeb04e1e16c4e68";

describe("insightViewCodeGenerator tests", () => {
    it("should generate code for insight", () => {
        const insight = recordedInsights(ReferenceRecordings.Recordings).find(
            (insight) => insightUri(insight) === INSIGHT_URI,
        );
        expect(
            insightViewCodeGenerator(insight, {
                context: {
                    settings: {
                        enableAxisNameConfiguration: true,
                        enableHidingOfDataPoints: true,
                        locale: "en-US",
                        separators: { decimal: ".", thousand: "," },
                        userId: "user",
                        workspace: "workspace",
                    },
                },
                language: "ts",
            }),
        ).toMatchSnapshot();
    });
});
