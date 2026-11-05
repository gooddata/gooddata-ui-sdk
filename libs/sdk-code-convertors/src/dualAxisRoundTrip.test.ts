// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { declarativeVisualisationToYaml } from "./from/declarativeVisualisationToYaml.js";
import { yamlVisualisationToDeclarative } from "./to/yamlVisualisationToDeclarative.js";

type DualAxisChartType = "line_chart" | "column_chart" | "bar_chart";

function controlsOf(declarative: ReturnType<typeof yamlVisualisationToDeclarative>) {
    return (declarative.content as { properties?: { controls?: Record<string, unknown> } }).properties
        ?.controls;
}

function dualAxisChart(type: DualAxisChartType, config?: Visualisation["config"]): Visualisation {
    return {
        type,
        id: `dual_axis_${type}`,
        title: "Dual axis",
        query: {
            fields: {
                amount: "metric/amount",
                median_amount: "metric/median_amount",
            },
        },
        metrics: ["amount", { field: "median_amount", axis: "secondary" }],
        ...(config ? { config } : {}),
    } as Visualisation;
}

describe("dual axis round-trip", () => {
    describe.each([
        ["line_chart", "secondary_yaxis"],
        ["column_chart", "secondary_yaxis"],
        ["bar_chart", "secondary_xaxis"],
    ] satisfies Array<[DualAxisChartType, string]>)("%s", (type, secondaryAxisKey) => {
        it(`maps axis: secondary to controls.${secondaryAxisKey}.measures`, () => {
            const declarative = yamlVisualisationToDeclarative([], dualAxisChart(type));

            expect(controlsOf(declarative)?.[secondaryAxisKey]).toEqual({ measures: ["median_amount"] });
        });

        it(`maps controls.${secondaryAxisKey}.measures back to axis: secondary`, () => {
            const declarative = yamlVisualisationToDeclarative([], dualAxisChart(type));
            const { json } = declarativeVisualisationToYaml([], declarative);

            expect(json?.metrics).toEqual(["amount", { field: "median_amount", axis: "secondary" }]);
            expect(json?.config).toBeUndefined();
        });

        it("is lossless in both directions", () => {
            const original = dualAxisChart(type);

            const declarative = yamlVisualisationToDeclarative([], original);
            const { json } = declarativeVisualisationToYaml([], declarative);
            const declarativeAgain = yamlVisualisationToDeclarative([], json as Visualisation);

            expect(json).toEqual(original);
            expect(declarativeAgain).toEqual(declarative);
        });

        it("does not add a secondary axis when no metric uses it", () => {
            const original = {
                ...dualAxisChart(type),
                metrics: ["amount", "median_amount"],
            } as Visualisation;

            const declarative = yamlVisualisationToDeclarative([], original);
            const { json } = declarativeVisualisationToYaml([], declarative);

            expect(controlsOf(declarative)?.[secondaryAxisKey]).toBeUndefined();
            expect(json).toEqual(original);
        });

        it("ignores secondary axis measures that are not in the metrics bucket", () => {
            const declarative = yamlVisualisationToDeclarative([], dualAxisChart(type));
            const controls = controlsOf(declarative)!;
            controls[secondaryAxisKey] = { measures: ["median_amount", "removed_metric"] };

            const { json } = declarativeVisualisationToYaml([], declarative);

            expect(json?.metrics).toEqual(["amount", { field: "median_amount", axis: "secondary" }]);
        });
    });

    it.each(["line_chart", "column_chart"] satisfies DualAxisChartType[])(
        "round-trips right axis settings for %s",
        (type) => {
            const original = dualAxisChart(type, {
                yaxis_secondary_format: "inherit",
                yaxis_secondary_max: 100,
                yaxis_secondary_min: 0,
                yaxis_secondary_name_position: "left",
                yaxis_secondary_name_visible: false,
                yaxis_secondary_rotation: "30",
                yaxis_secondary_visible: false,
                yaxis_secondary_labels: false,
            });

            const declarative = yamlVisualisationToDeclarative([], original);
            const { json } = declarativeVisualisationToYaml([], declarative);

            expect(controlsOf(declarative)?.["secondary_yaxis"]).toEqual({
                measures: ["median_amount"],
                format: "inherit",
                max: "100",
                min: "0",
                name: { position: "left", visible: false },
                rotation: "30",
                visible: false,
                labelsEnabled: false,
            });
            expect(json).toEqual(original);
        },
    );

    it("round-trips top axis settings for bar_chart", () => {
        const original = dualAxisChart("bar_chart", {
            xaxis_secondary_format: "inherit",
            xaxis_secondary_max: 100,
            xaxis_secondary_min: 0,
            xaxis_secondary_name_position: "left",
            xaxis_secondary_name_visible: false,
            xaxis_secondary_rotation: "30",
            xaxis_secondary_visible: false,
            xaxis_secondary_labels: false,
        });

        const declarative = yamlVisualisationToDeclarative([], original);
        const { json } = declarativeVisualisationToYaml([], declarative);

        expect(controlsOf(declarative)?.["secondary_xaxis"]).toEqual({
            measures: ["median_amount"],
            format: "inherit",
            max: "100",
            min: "0",
            name: { position: "left", visible: false },
            rotation: "30",
            visible: false,
            labelsEnabled: false,
        });
        expect(json).toEqual(original);
    });
});
