// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IInsightDefinition, newInsightDefinition } from "@gooddata/sdk-model";
import { type IConditionalFormatting } from "@gooddata/sdk-ui-pivot/next";

import { type IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";

import { PivotTableNextDescriptor } from "./PivotTableNextDescriptor.js";

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

describe("PivotTableNext embedding code", () => {
    const descriptor = new PivotTableNextDescriptor();

    it("emits conditionalFormatting typed with the CF-extended config when the setting is enabled", () => {
        const insight = newTableInsight({ conditionalFormatting });

        const code = descriptor.getEmbeddingCode(insight, {
            context: newContext({ enableConditionalFormatting: true, enableNewPivotTable: true }),
        });

        expect(code).toContain("conditionalFormatting");
        expect(code).toContain("PivotTableNextConfigWithConditionalFormatting");
    });

    it("emits the public config type and no conditionalFormatting when the setting is disabled", () => {
        const insight = newTableInsight({ conditionalFormatting });

        const code = descriptor.getEmbeddingCode(insight, {
            context: newContext({ enableConditionalFormatting: false }),
        });

        expect(code).not.toContain("conditionalFormatting");
        expect(code).not.toContain("PivotTableNextConfigWithConditionalFormatting");
        expect(code).toContain("PivotTableNextConfig");
    });

    it("emits the public config type when the insight has no conditional formatting", () => {
        const code = descriptor.getEmbeddingCode(newTableInsight(), {
            context: newContext({ enableConditionalFormatting: true }),
        });

        expect(code).not.toContain("PivotTableNextConfigWithConditionalFormatting");
        expect(code).toContain("PivotTableNextConfig");
    });

    it("does not emit undefined config members", () => {
        const code = descriptor.getEmbeddingCode(newTableInsight(), { context: newContext() });

        expect(code).not.toContain("textWrapping: undefined");
        expect(code).not.toContain("columnWidths: undefined");
    });
});
