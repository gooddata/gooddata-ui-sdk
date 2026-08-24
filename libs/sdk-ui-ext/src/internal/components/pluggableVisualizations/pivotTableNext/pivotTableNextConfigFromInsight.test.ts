// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IInsightDefinition, newInsightDefinition } from "@gooddata/sdk-model";
import { type IConditionalFormatting } from "@gooddata/sdk-ui-pivot/next";

import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

import { pivotTableNextConfigFromInsight } from "./pivotTableNextConfigFromInsight.js";

const conditionalFormatting: IConditionalFormatting = {
    enabled: true,
    rules: [
        {
            id: "rule-1",
            target: { kind: "measure", measureIdentifier: "m1" },
            conditions: [
                {
                    id: "condition-1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 100 },
                    format: { backgroundColor: "#E54D40", scope: "cell" },
                },
            ],
        },
    ],
};

function newTableInsight(controls: Record<string, unknown> = {}): IInsightDefinition {
    return newInsightDefinition("local:table", (builder) => builder.properties({ controls }));
}

function newContext(settingOverrides: Partial<IUserWorkspaceSettings> = {}): IEmbeddingCodeContext {
    const settings: IUserWorkspaceSettings = {
        userId: "user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
        workspace: "workspace",
        ...settingOverrides,
    };
    return { settings };
}

describe("pivotTableNextConfigFromInsight", () => {
    it("includes conditionalFormatting from insight properties when the setting is enabled", () => {
        const insight = newTableInsight({ conditionalFormatting });
        const ctx = newContext({ enableConditionalFormatting: true });

        const config = pivotTableNextConfigFromInsight(insight, ctx);

        expect(config.conditionalFormatting).toEqual(conditionalFormatting);
    });

    it("omits conditionalFormatting when the setting is disabled", () => {
        const insight = newTableInsight({ conditionalFormatting });
        const ctx = newContext({ enableConditionalFormatting: false });

        const config = pivotTableNextConfigFromInsight(insight, ctx);

        expect(config).not.toHaveProperty("conditionalFormatting");
    });

    it("omits conditionalFormatting when the setting is absent", () => {
        const insight = newTableInsight({ conditionalFormatting });

        const config = pivotTableNextConfigFromInsight(insight, newContext());

        expect(config).not.toHaveProperty("conditionalFormatting");
    });

    it("omits conditionalFormatting when the context is undefined", () => {
        const insight = newTableInsight({ conditionalFormatting });

        const config = pivotTableNextConfigFromInsight(insight, undefined);

        expect(config).not.toHaveProperty("conditionalFormatting");
    });

    it("omits conditionalFormatting when the insight has none", () => {
        const insight = newTableInsight();
        const ctx = newContext({ enableConditionalFormatting: true });

        const config = pivotTableNextConfigFromInsight(insight, ctx);

        expect(config).not.toHaveProperty("conditionalFormatting");
    });
});
