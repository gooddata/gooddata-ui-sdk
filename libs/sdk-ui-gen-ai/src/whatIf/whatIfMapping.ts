// (C) 2026 GoodData Corporation

import {
    type IExecutionConfig,
    type IGenAIVisualization,
    type IInsight,
    type IMeasureDefinitionOverride,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import type { IChatConversationLocalContent } from "../model.js";

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
 * Interface representing the definition of a "What-If" analysis.
 */
export interface IWhatIfDefinition {
    scenarios: IWhatIfRenderableScenario[];
    insight: IInsight;
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

/**
 * Loads what-if scenarios from a JSON file.
 * @returns Array of renderable scenarios, or undefined if the file is not found or invalid.
 * @internal
 */
export function loadWhatIfScenarios(content: IChatConversationLocalContent): IWhatIfDefinition | undefined {
    const whatIf = content.parts?.find((p) => p.type === "whatIf");

    //No what if
    if (!whatIf || whatIf.whatIf.scenarios.length === 0) {
        return undefined;
    }

    // Search for visualizations
    const visualisation = content.parts?.find((p) => p.type === "visualization");
    if (!visualisation?.visualization) {
        return undefined;
    }

    const scenarios: IWhatIfRenderableScenario[] = [];

    if (whatIf.whatIf.includeBaseline) {
        scenarios.push({
            label: visualisation.visualization.insight.title,
            execConfig: undefined,
            isBaseline: true,
        });
    }

    for (const scenario of whatIf.whatIf.scenarios) {
        const overrides: IMeasureDefinitionOverride[] = scenario.adjustments.map((adj) => ({
            item: objRefToIdentifier(adj.ref),
            definition: {
                inline: {
                    maql: adj.scenarioMaql,
                },
            },
        }));

        scenarios.push({
            label: scenario.label,
            execConfig: overrides.length > 0 ? { measureDefinitionOverrides: overrides } : undefined,
            isBaseline: false,
        });
    }

    return {
        scenarios,
        insight: visualisation.visualization,
    };
}

function objRefToIdentifier(objRef: ObjRef) {
    if (isIdentifierRef(objRef)) {
        return {
            identifier: {
                id: objRef.identifier,
                type: objRef.type === "measure" ? "metric" : (objRef.type ?? "metric"),
            },
        } as IMeasureDefinitionOverride["item"];
    }
    return {
        identifier: {
            id: objRef.uri,
            type: "metric" as const,
        },
    } as IMeasureDefinitionOverride["item"];
}
