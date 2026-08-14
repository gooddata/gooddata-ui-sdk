// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
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

describe("ConditionalFormattingSection — Add-rule dialog target picker", () => {
    it("keeps the target dropdown editable when adding a new rule, even with a single target option", async () => {
        const user = userEvent.setup();
        const monthMeta: ICfTargetData = { dates: { d1: { granularity: "GDC.time.month" } } };
        renderSection(monthMeta, { enabled: true, rules: [] });

        await user.click(screen.getByText("Add"));

        expect(document.querySelector(".gd-cf-dialog__target-picker")).toBeInTheDocument();
        expect(document.querySelector(".gd-cf-dialog__static-target-title")).not.toBeInTheDocument();
    });
});

// PR-5: the panel visibility slice for semantic-layer-inherited rules — pure viewing, no controls.
describe("ConditionalFormattingSection — semantic layer inheritance (PR-5)", () => {
    const measureAttributeInsight: IInsightDefinition = {
        insight: {
            title: "table",
            visualizationUrl: "local:table",
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: { measureDefinition: { item: { uri: "measure" } } },
                            },
                        },
                    ],
                },
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

    const SEMANTIC = {
        conditions: [
            {
                id: "c1",
                operator: "EQUAL_TO" as const,
                value: { kind: "literal" as const, value: "Direct Sales" },
                format: { backgroundColor: "#E54D40", scope: "cell" as const },
            },
        ],
    };

    function renderSemanticSection(
        targetData: ICfTargetData | undefined,
        config: IConditionalFormatting | undefined,
    ) {
        return render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );
    }

    it("hides the semantic block when there is no semantic data", () => {
        renderSemanticSection(undefined, { enabled: true, rules: [] });
        expect(screen.queryByText("From semantic layer")).not.toBeInTheDocument();
    });

    it("keeps showing an untouched target's inherited row even when config.enabled is false", () => {
        // `enabled` only ever deactivates the insight's OWN authored rules — the engine keeps
        // painting an untouched (Inherited) target regardless, so the panel must too.
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        renderSemanticSection(targetData, { enabled: false, rules: [] });
        expect(screen.getByText("From semantic layer")).toBeInTheDocument();
        expect(screen.getByText("View rule")).toBeInTheDocument();
    });

    it("still excludes a Custom (authored) target from the semantic block when config.enabled is false", () => {
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        const config: IConditionalFormatting = {
            enabled: false,
            rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
        };
        renderSemanticSection(targetData, config);
        expect(screen.queryByText("From semantic layer")).not.toBeInTheDocument();
    });

    it("shows the semantic block when config is undefined (a fresh insight still inherits)", () => {
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        renderSemanticSection(targetData, undefined);
        expect(screen.getByText("From semantic layer")).toBeInTheDocument();
        expect(screen.getByText("View rule")).toBeInTheDocument();
    });

    it("does not show the empty-rule hint alongside an inherited row (no custom rules yet)", () => {
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        renderSemanticSection(targetData, undefined);
        expect(screen.queryByText("Highlight cells or rows that match a rule.")).not.toBeInTheDocument();
    });

    it("shows a row only for the inherited target, excluding one already Custom", () => {
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC, d1: SEMANTIC } };
        const config: IConditionalFormatting = {
            enabled: true,
            rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
        };
        renderSemanticSection(targetData, config);
        // m1 is already Custom via its authored rule — only d1's inherited row should show.
        expect(screen.getAllByText("View rule")).toHaveLength(1);
    });

    it("clicking View opens the dialog read-only, with the right single target and conditions", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        renderSemanticSection(targetData, { enabled: true, rules: [] });

        await user.click(screen.getByText("View rule"));

        // Dialog title reads "View rule" (readOnly), not "Edit rule".
        expect(document.querySelector(".gd-cf-dialog__title")).toHaveTextContent("View rule");
        // Static single-target header kicked in (only one target option was passed to the dialog).
        expect(document.querySelector(".gd-cf-dialog__static-target-title")).toHaveTextContent("d1");
        expect(document.querySelector(".gd-cf-dialog__target-picker")).not.toBeInTheDocument();
        // Read-only: no Save button.
        expect(screen.queryByText("Save")).not.toBeInTheDocument();
        // The injected condition's value rendered through (readOnly-disabled) text input.
        expect(screen.getByDisplayValue("Direct Sales")).toBeInTheDocument();
    });

    it("closes an open semantic dialog once its target stops being Inherited (e.g. loading cleared the payload)", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const config: IConditionalFormatting = { enabled: true, rules: [] };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("View rule"));
        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();

        // Simulates handleLoadingChanged clearing targetData.semantic while the dialog is open.
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={{ semantic: {} }}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(document.querySelector(".gd-cf-dialog__title")).not.toBeInTheDocument();
    });

    it("does not silently reopen a dialog closed by a loading blip once the same target's data returns", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const config: IConditionalFormatting = { enabled: true, rules: [] };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("View rule"));

        const rerenderWith = (data: ICfTargetData) =>
            rerender(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        targetData={data}
                        pushData={() => {}}
                    />
                </InternalIntlWrapper>,
            );

        // A loading blip clears semantic data (dialog hides)...
        rerenderWith({ semantic: {} });
        expect(document.querySelector(".gd-cf-dialog__title")).not.toBeInTheDocument();

        // ...then the same target's data returns. Without clearing `dialog` state (not just hiding it
        // from render), this would silently reopen — the user never clicked View again.
        rerenderWith(targetData);
        expect(document.querySelector(".gd-cf-dialog__title")).not.toBeInTheDocument();
    });

    it("closes an open semantic dialog once its target becomes Custom (an authored rule was added)", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: { enabled: true, rules: [] } } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("View rule"));
        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();

        // d1 gains an authored rule elsewhere (e.g. AAC) while the semantic View dialog is still open.
        const customConfig: IConditionalFormatting = {
            enabled: true,
            rules: [{ id: "r1", target: { kind: "attribute", attributeIdentifier: "d1" }, conditions: [] }],
        };
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: customConfig } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(document.querySelector(".gd-cf-dialog__title")).not.toBeInTheDocument();
    });

    it("shows the semantic rule's current conditions if they change while the dialog is open", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const config: IConditionalFormatting = { enabled: true, rules: [] };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("View rule"));
        expect(screen.getByDisplayValue("Direct Sales")).toBeInTheDocument();

        // A new data view lands with an updated semantic condition for the same target (d1) while open.
        const updatedTargetData: ICfTargetData = {
            semantic: {
                d1: {
                    conditions: [
                        {
                            id: "c1",
                            operator: "EQUAL_TO",
                            value: { kind: "literal", value: "Retail" },
                            format: { backgroundColor: "#E54D40", scope: "cell" },
                        },
                    ],
                },
            },
        };
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    targetData={updatedTargetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByDisplayValue("Retail")).toBeInTheDocument();
        expect(screen.queryByDisplayValue("Direct Sales")).not.toBeInTheDocument();
    });
});
