// (C) 2026 GoodData Corporation

import type { IExecutionConfig, IGenAIVisualization, IMeasureDefinitionOverride } from "@gooddata/sdk-model";

/**
 * A renderable what-if scenario with optional execution config overrides.
 * @internal
 */
export interface IWhatIfRenderableScenario {
    /**
     * Display label for the scenario.
     */
    label: string;
    /**
     * Execution config with measure definition overrides. Undefined for baseline.
     */
    execConfig?: IExecutionConfig;
    /**
     * Whether this scenario represents the unmodified baseline.
     */
    isBaseline: boolean;
}

/**
 * Maps a visualization's what-if config to an array of renderable scenarios.
 *
 * @param visualization - The GenAI visualization definition.
 * @returns Array of renderable scenarios, or undefined if no what-if config is present.
 * @internal
 */
export function mapVisualizationWhatIfToScenarios(
    visualization?: IGenAIVisualization,
): IWhatIfRenderableScenario[] | undefined {
    const whatIf = visualization?.config?.whatIf;

    if (!whatIf || whatIf.scenarios.length === 0) {
        return undefined;
    }

    const result: IWhatIfRenderableScenario[] = [];

    if (whatIf.includeBaseline) {
        result.push({
            label: visualization!.title,
            execConfig: undefined,
            isBaseline: true,
        });
    }

    for (const scenario of whatIf.scenarios) {
        const overrides: IMeasureDefinitionOverride[] = scenario.adjustments
            .filter((adj) => adj.metricType === "metric")
            .map((adj) => ({
                item: {
                    identifier: {
                        id: adj.metricId,
                        type: "metric" as const,
                    },
                },
                definition: {
                    inline: {
                        maql: adj.scenarioMaql,
                    },
                },
            }));

        result.push({
            label: scenario.label,
            execConfig: overrides.length > 0 ? { measureDefinitionOverrides: overrides } : undefined,
            isBaseline: false,
        });
    }

    return result;
}
