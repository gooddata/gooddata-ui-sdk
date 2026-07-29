// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IInsightDefinition } from "@gooddata/sdk-model";
import { type IConditionalFormatting } from "@gooddata/sdk-ui-pivot/next";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { type ICfTargetData } from "../conditionalFormattingModel.js";
import { ConditionalFormattingSection } from "../ConditionalFormattingSection.js";

const insight: IInsightDefinition = {
    insight: {
        title: "table",
        visualizationUrl: "local:table",
        buckets: [
            {
                localIdentifier: "attribute",
                items: [
                    {
                        attribute: {
                            localIdentifier: "d1",
                            displayForm: { uri: "/gdc/md/project/obj/1" },
                        },
                    },
                ],
            },
        ],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const dateRuleConfig = (from: string): IConditionalFormatting => ({
    enabled: true,
    rules: [
        {
            id: "r1",
            target: { kind: "attribute", attributeIdentifier: "d1" },
            conditions: [
                {
                    id: "c1",
                    operator: "EQUAL_TO",
                    value: { kind: "absoluteDate", from, to: "2023-12-31" },
                    format: { color: "#E54D40", scope: "cell" },
                },
            ],
        },
    ],
});

function renderSection(targetData: ICfTargetData | undefined, config: IConditionalFormatting) {
    return render(
        <InternalIntlWrapper>
            <ConditionalFormattingSection
                properties={{ controls: { conditionalFormatting: config } }}
                propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                insight={insight}
                targetData={targetData}
                pushData={() => {}}
            />
        </InternalIntlWrapper>,
    );
}

// The badge/authoring behavior around targetData readiness: date completeness can only be judged
// once a data view delivered the attribute metadata (targetData.dates exists).
describe("ConditionalFormattingSection — date metadata readiness", () => {
    const malformedConfig = dateRuleConfig("12/24/2023"); // unparseable platform string
    const monthMeta: ICfTargetData = { dates: { d1: { granularity: "GDC.time.month" } } };

    it("suppresses the invalid badge and disables authoring while date metadata is unknown", () => {
        renderSection({}, malformedConfig); // e.g. before the first data view or after an exec error
        expect(screen.queryByText("Column not found")).not.toBeInTheDocument();
        expect(screen.queryByText("Invalid value")).not.toBeInTheDocument();
        // The kit Button conveys disabled via aria-disabled, not the native attribute.
        expect(screen.getByText("Add").closest("button")).toHaveAttribute("aria-disabled", "true");
        // The chip's edit surface is disabled too — opening the dialog now would silently author a
        // plain-text rule against a date attribute.
        expect(screen.getByTitle("Edit rule")).toBeDisabled();
    });

    it("flags an unresolvable rule and enables authoring once date metadata arrived", () => {
        renderSection(monthMeta, malformedConfig);
        // The target still exists — the VALUE is what cannot resolve, and the badge says so.
        expect(screen.getByText("Invalid value")).toBeInTheDocument();
        expect(screen.queryByText("Column not found")).not.toBeInTheDocument();
        expect(screen.getByText("Add").closest("button")).not.toHaveAttribute("aria-disabled", "true");
        expect(screen.getByTitle("Edit rule")).toBeEnabled();
    });

    it("does not flag resolvable date rules once metadata arrived (incl. partial-period overlap)", () => {
        renderSection(monthMeta, dateRuleConfig("2023-12-01"));
        expect(screen.queryByText("Column not found")).not.toBeInTheDocument();
        expect(screen.queryByText("Invalid value")).not.toBeInTheDocument();
        // A partial-month range resolves by overlap — no drift badge.
        renderSection(monthMeta, dateRuleConfig("2023-12-02"));
        expect(screen.queryByText("Invalid value")).not.toBeInTheDocument();
    });

    it("flags a rule whose target left the insight even while metadata is unknown", () => {
        const orphaned: IConditionalFormatting = {
            enabled: true,
            rules: [
                {
                    id: "r1",
                    target: { kind: "attribute", attributeIdentifier: "gone" },
                    conditions: [],
                },
            ],
        };
        renderSection({}, orphaned);
        expect(screen.getByText("Column not found")).toBeInTheDocument();
    });
});
