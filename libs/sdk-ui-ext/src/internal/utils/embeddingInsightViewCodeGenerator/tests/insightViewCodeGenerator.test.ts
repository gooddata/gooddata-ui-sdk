// (C) 2022 GoodData Corporation

import { insightViewCodeGenerator } from "../insightViewCodeGenerator";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { idRef, IInsight, insightUri, newInsightDefinition } from "@gooddata/sdk-model";

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

    it("should generate code for insight geo chart and define config with mapbox Token placeholder", () => {
        const insightDef = newInsightDefinition("local:pushpin", (b) => {
            return b.title("Name");
        });

        const insight: IInsight = {
            insight: {
                ...insightDef.insight,
                identifier: "id",
                uri: "uri",
                ref: idRef("id", "insight"),
            },
        };

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

    it("should generate code for insight with non default locale", () => {
        const insight = recordedInsights(ReferenceRecordings.Recordings).find(
            (insight) => insightUri(insight) === INSIGHT_URI,
        );
        expect(
            insightViewCodeGenerator(insight, {
                context: {
                    settings: {
                        enableAxisNameConfiguration: true,
                        enableHidingOfDataPoints: true,
                        locale: "de-DE",
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
