// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type IInsightDefinition } from "@gooddata/sdk-model";
import { type IConditionalFormatting } from "@gooddata/sdk-ui-pivot/next";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";

import { type ICfTargetData } from "./conditionalFormattingModel.js";
import { ConditionalFormattingSection } from "./ConditionalFormattingSection.js";

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

// The panel visibility slice for semantic-layer-inherited rules — which targets show a row at all,
// and when. The Inherited <-> Custom controls tested below (Turn off/on and revert) build on this
// same visibility/inclusion set without changing it; only the row's entry point (Edit, not View) and
// the dialog's lock behavior (checkbox-driven, not forced readOnly) differ from an earlier iteration.
describe("ConditionalFormattingSection — semantic layer inheritance", () => {
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
                    enableSemanticConditionalFormatting
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

    it("hides the semantic block when enableSemanticConditionalFormatting is off, even with live semantic data", () => {
        // Mirrors the engine's own flag (see PluggablePivotTableNext) — showing an inherited row the
        // table won't actually paint would desync the panel from what's on screen. Defaults to off,
        // so this omits the prop entirely rather than passing `false`.
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        render(
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
        expect(screen.queryByText("From semantic layer")).not.toBeInTheDocument();
        expect(screen.queryByText("Edit rule")).not.toBeInTheDocument();
        expect(screen.getByText("Highlight cells or rows that match a rule.")).toBeInTheDocument();
    });

    it("offers no new semantic rows while the map is confirmed stale (semanticFresh: false), unlike an already-open dialog", () => {
        // Distinct from keeping an ALREADY-open dialog alive (protected separately, and by the
        // dialog's own recovery logic) — a brand-new row opened from a stale map could let the user
        // View/suppress/customize a rule about to be superseded by the in-flight execution.
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC }, semanticFresh: false };
        render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: { enabled: true, rules: [] } } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );
        expect(screen.queryByText("From semantic layer")).not.toBeInTheDocument();
        expect(screen.queryByText("Edit rule")).not.toBeInTheDocument();
    });

    it("keeps showing an untouched target's inherited row even when config.enabled is false", () => {
        // `enabled` only ever deactivates the insight's OWN authored rules — the engine keeps
        // painting an untouched (Inherited) target regardless, so the panel must too.
        const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
        renderSemanticSection(targetData, { enabled: false, rules: [] });
        expect(screen.getByText("From semantic layer")).toBeInTheDocument();
        expect(screen.getByText("Edit rule")).toBeInTheDocument();
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
        expect(screen.getByText("Edit rule")).toBeInTheDocument();
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
        expect(screen.getAllByText("Edit rule")).toHaveLength(1);
    });

    it("clicking Edit opens the dialog checked (Inherited) by default, locked, with the right single target and conditions", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        renderSemanticSection(targetData, { enabled: true, rules: [] });

        await user.click(screen.getByText("Edit rule"));

        // A target with a semantic fallback reads as a plain "Rule" dialog, not "Edit rule"/"View rule".
        expect(document.querySelector(".gd-cf-dialog__title")).toHaveTextContent("Rule");
        expect(screen.getByLabelText("Use default rule")).toBeChecked();
        // Static single-target header kicked in (only one target option was passed to the dialog).
        expect(document.querySelector(".gd-cf-dialog__static-target-title")).toHaveTextContent("d1");
        expect(document.querySelector(".gd-cf-dialog__target-picker")).not.toBeInTheDocument();
        // Locked while checked (Inherited): fields disabled; Save stays present (it can still close/revert).
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", true);
        expect(screen.getByText("Save")).toBeInTheDocument();
        // The injected condition's value rendered through the (locked) text input.
        expect(screen.getByDisplayValue("Direct Sales")).toBeInTheDocument();
        // The disabled delete affordance (with its "disable it in the rule list" tooltip) is
        // actually reachable through the Section's own wiring here, not just a dialog unit test
        // that passes a mock `onDelete` the real semantic-row flow never supplies.
        expect(screen.getByLabelText("Delete rule")).toBeDisabled();
    });

    it("keeps an open semantic dialog open (falls back to editable) when its semantic default disappears, instead of discarding it", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const config: IConditionalFormatting = { enabled: true, rules: [] };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("Edit rule"));
        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();

        // The default itself vanishes (the catalog rule was removed, a data-view blip) — this must
        // NOT unmount the dialog: that would discard a draft the user may have already started typing
        // after unchecking "Use default rule", before the dialog's own recovery logic ever runs.
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    enableSemanticConditionalFormatting
                    targetData={{ semantic: {} }}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();
        expect(screen.queryByText("Use default rule")).not.toBeInTheDocument();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
    });

    it("does not discard an edit made after the semantic default vanished once the target's data returns", async () => {
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const config: IConditionalFormatting = { enabled: true, rules: [] };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: config } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("Edit rule"));

        const rerenderWith = (data: ICfTargetData) =>
            rerender(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        enableSemanticConditionalFormatting
                        targetData={data}
                        pushData={() => {}}
                    />
                </InternalIntlWrapper>,
            );

        // The default vanishes — the dialog stays open and unlocked (previous test).
        rerenderWith({ semantic: {} });
        const valueInput = screen.getByDisplayValue("Direct Sales");
        await user.clear(valueInput);
        await user.type(valueInput, "Retail");

        // The same target's data returns while that edit is sitting in the now-unlocked fields. The
        // checkbox reappears (activeSemantic is defined again) but must stay unchecked, not silently
        // re-lock and discard the edit via wantsDefault having been forced off when it first vanished.
        rerenderWith(targetData);

        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();
        expect(screen.getByLabelText("Use default rule")).not.toBeChecked();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
        expect(screen.getByDisplayValue("Retail")).toBeInTheDocument();
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
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("Edit rule"));
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
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(document.querySelector(".gd-cf-dialog__title")).not.toBeInTheDocument();
    });

    it("closes an open semantic dialog once its target is removed from the insight itself, not just its default", async () => {
        // Distinct from the default merely vanishing (target still present — handled by falling back
        // to editable, tested elsewhere): once the target itself leaves `targetOptions`, there is no
        // longer anything for a Save to even target — must close, not keep offering a stale draft.
        const user = userEvent.setup();
        const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: { enabled: true, rules: [] } } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={measureAttributeInsight}
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("Edit rule"));
        expect(document.querySelector(".gd-cf-dialog__title")).toBeInTheDocument();

        // d1's attribute bucket is removed from the insight entirely (not just its semantic default).
        const insightWithoutAttribute: IInsightDefinition = {
            insight: {
                ...measureAttributeInsight.insight,
                buckets: measureAttributeInsight.insight.buckets.filter(
                    (bucket) => bucket.localIdentifier !== "attribute",
                ),
            },
        };
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingSection
                    properties={{ controls: { conditionalFormatting: { enabled: true, rules: [] } } }}
                    propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                    insight={insightWithoutAttribute}
                    enableSemanticConditionalFormatting
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
                    enableSemanticConditionalFormatting
                    targetData={targetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        await user.click(screen.getByText("Edit rule"));
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
                    enableSemanticConditionalFormatting
                    targetData={updatedTargetData}
                    pushData={() => {}}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.getByDisplayValue("Retail")).toBeInTheDocument();
        expect(screen.queryByDisplayValue("Direct Sales")).not.toBeInTheDocument();
    });

    // Inherited <-> Custom controls — the "Use default rule" checkbox (in the dialog, tested in
    // ConditionalFormattingDialog.test.tsx) and the row-level on/off (suppressedTargets) toggle.
    describe("Turn off/on and revert", () => {
        const toggle = () => screen.getByRole("checkbox", { name: /Turn formatting on\/off/ });

        function renderWithPushData(
            targetData: ICfTargetData | undefined,
            config: IConditionalFormatting | undefined,
        ) {
            const pushData = vi.fn();
            const { rerender } = render(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        enableSemanticConditionalFormatting
                        targetData={targetData}
                        pushData={pushData}
                    />
                </InternalIntlWrapper>,
            );
            // `pushData` is a spy, not wired back to `properties` — apply its own output through a
            // rerender to see the resulting DOM, the same way the invalidation tests above simulate a
            // parent applying a new data view.
            const applyLastPush = () =>
                rerender(
                    <InternalIntlWrapper>
                        <ConditionalFormattingSection
                            properties={pushData.mock.calls[pushData.mock.calls.length - 1][0].properties}
                            propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                            insight={measureAttributeInsight}
                            enableSemanticConditionalFormatting
                            targetData={targetData}
                            pushData={pushData}
                        />
                    </InternalIntlWrapper>,
                );
            return { pushData, applyLastPush };
        }

        const committedConfig = (pushData: ReturnType<typeof vi.fn>, call = 0): IConditionalFormatting =>
            pushData.mock.calls[call][0].properties.controls.conditionalFormatting;

        it("still renders a suppressed (suppressedTargets, no rule) target in the semantic block, tagged off", () => {
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            renderSemanticSection(targetData, config);

            expect(screen.getByText("From semantic layer")).toBeInTheDocument();
            expect(document.querySelector(".gd-cf-rule--off")).toBeInTheDocument();
            expect(toggle()).not.toBeChecked();
            // Off rows don't offer an Edit entry point — nothing to view/edit while suppressed.
            expect(screen.queryByText("Edit rule")).not.toBeInTheDocument();
        });

        it("toggling a still-Inherited row off writes a suppressedTargets entry, leaving rules untouched", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const { pushData } = renderWithPushData(targetData, { enabled: true, rules: [] });

            await user.click(toggle());

            const next = committedConfig(pushData);
            expect(next.suppressedTargets).toEqual([{ kind: "measure", measureIdentifier: "m1" }]);
            expect(next.rules).toEqual([]);
        });

        it("toggling an off target back on removes it from suppressedTargets", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const { pushData } = renderWithPushData(targetData, config);

            await user.click(toggle());

            // Omitted entirely, not set to an empty array — see `withSuppressedTargets`.
            expect(committedConfig(pushData).suppressedTargets).toBeUndefined();
        });

        it("checking 'Use default rule' on an existing custom rule and saving reverts it to plain Inherited (not Off)", async () => {
            const user = userEvent.setup();
            // `dates: {}` marks execution-resolved metadata as ready — otherwise the RuleChip's own
            // edit trigger stays disabled (see the "date metadata readiness" describe block above).
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC }, dates: {} };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
            };
            const { pushData, applyLastPush } = renderWithPushData(targetData, config);

            await user.click(screen.getByTitle("Edit rule")); // the RuleChip's own edit trigger
            await user.click(screen.getByLabelText("Use default rule"));
            await user.click(screen.getByText("Save"));

            const next = committedConfig(pushData);
            expect(next.rules).toEqual([]);
            expect(next.suppressedTargets ?? []).toEqual([]);
            // Not just falsy — the key itself must be absent from the committed properties, or it
            // creates deep-equal noise/spurious dirty state in-session (JSON persistence alone would
            // have dropped an explicit `undefined` anyway, but that happens later, not here).
            expect("suppressedTargets" in next).toBe(false);

            // The row is visible again in the semantic block, plain Inherited — not tagged Off.
            applyLastPush();
            expect(screen.getByText("From semantic layer")).toBeInTheDocument();
            expect(screen.getByText("Edit rule")).toBeInTheDocument();
            expect(document.querySelector(".gd-cf-rule--off")).not.toBeInTheDocument();
        });

        it("reverting a target that is (inconsistently) both authored AND listed in suppressedTargets clears both, landing plain Inherited not Off", async () => {
            // Shouldn't arise through this panel alone, but a rule can reach it authored elsewhere
            // (AAC, a prior panel version) while still carrying a stale suppressedTargets suppression
            // entry. Deleting only the rule and leaving that entry would keep the engine treating
            // the target as Custom-with-zero-rules (Off) even though the user asked for Inherited.
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC }, dates: {} };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const { pushData, applyLastPush } = renderWithPushData(targetData, config);

            await user.click(screen.getByTitle("Edit rule"));
            await user.click(screen.getByLabelText("Use default rule"));
            await user.click(screen.getByText("Save"));

            const next = committedConfig(pushData);
            expect(next.rules).toEqual([]);
            // Omitted entirely, not set to an empty array — see `withSuppressedTargets`.
            expect(next.suppressedTargets).toBeUndefined();

            applyLastPush();
            expect(document.querySelector(".gd-cf-rule--off")).not.toBeInTheDocument();
            expect(screen.getByText("Edit rule")).toBeInTheDocument();
        });

        it("reverting one of several rules stacked on the same target clears all of them, not just the one open", async () => {
            // The Add flow doesn't prevent authoring more than one rule against the same target
            // (they stack, first-match-wins) — reverting via any one of them must still land the
            // target fully Inherited, not leave it Custom because a sibling rule is still authored.
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC }, dates: {} };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [
                    { id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] },
                    { id: "r2", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] },
                ],
            };
            const { pushData, applyLastPush } = renderWithPushData(targetData, config);

            await user.click(screen.getAllByTitle("Edit rule")[0]);
            await user.click(screen.getByLabelText("Use default rule"));
            await user.click(screen.getByText("Save"));

            const next = committedConfig(pushData);
            expect(next.rules).toEqual([]);

            applyLastPush();
            expect(document.querySelector(".gd-cf-rule--off")).not.toBeInTheDocument();
            expect(screen.getByText("Edit rule")).toBeInTheDocument();
        });

        it("deleting an authored rule via the RuleChip also strips a stale suppressedTargets entry for that target", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC }, dates: {} };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const { pushData } = renderWithPushData(targetData, config);

            await user.click(screen.getByLabelText("Delete rule"));

            const next = committedConfig(pushData);
            expect(next.rules).toEqual([]);
            expect(next.suppressedTargets).toBeUndefined();
        });

        it("prunes a suppressedTargets entry whose semantic rule has disappeared, on any other edit", async () => {
            const user = userEvent.setup();
            // m1's semantic rule is gone (e.g. the catalog rule was itself removed) but a stale
            // suppressedTargets entry for it still lingers from before — d1's is still live.
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const { pushData } = renderWithPushData(targetData, config);

            await user.click(toggle()); // any other edit — here, turning d1's suppression on

            const next = committedConfig(pushData);
            expect(next.suppressedTargets).toEqual([{ kind: "attribute", attributeIdentifier: "d1" }]);
        });

        it("does not prune suppressedTargets before the first data view arrives (semantic map not yet known)", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = {}; // no semantic data has arrived yet — unknown, not "gone"
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [
                    { id: "r2", target: { kind: "attribute", attributeIdentifier: "d1" }, conditions: [] },
                ],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const { pushData } = renderWithPushData(targetData, config);

            // Deleting the unrelated d1 rule is the "any other edit" that commits — must not also
            // drop m1's orphan-looking entry before we've actually confirmed its semantic rule is gone.
            await user.click(screen.getByLabelText("Delete rule"));

            expect(committedConfig(pushData).suppressedTargets).toEqual([
                { kind: "measure", measureIdentifier: "m1" },
            ]);
        });

        it("does not prune suppressedTargets while a new execution is in flight (semanticFresh: false)", async () => {
            const user = userEvent.setup();
            // Defined (not "unknown yet") but STALE — a new execution is in flight and hasn't landed,
            // so this may not reflect the current target set. m1's entry is genuinely absent here.
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC }, semanticFresh: false };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [
                    { id: "r2", target: { kind: "attribute", attributeIdentifier: "d1" }, conditions: [] },
                ],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const pushData = vi.fn();
            render(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        enableSemanticConditionalFormatting
                        targetData={targetData}
                        isLoading
                        pushData={pushData}
                    />
                </InternalIntlWrapper>,
            );

            // Deleting the unrelated d1 rule isn't isLoading-gated — must not prune m1 against the
            // soon-to-be-superseded map.
            await user.click(screen.getByLabelText("Delete rule"));

            expect(committedConfig(pushData).suppressedTargets).toEqual([
                { kind: "measure", measureIdentifier: "m1" },
            ]);
        });

        it("does not prune suppressedTargets once isLoading has settled but semanticFresh is still false (the handleDataView gap)", async () => {
            const user = userEvent.setup();
            // onLoadingChanged(false) can fire before handleDataView rebuilds `semantic` (or never, if
            // that execution fails) — isLoading alone can't see this, semanticFresh is tracked for it.
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC }, semanticFresh: false };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [
                    { id: "r2", target: { kind: "attribute", attributeIdentifier: "d1" }, conditions: [] },
                ],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const pushData = vi.fn();
            render(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        enableSemanticConditionalFormatting
                        targetData={targetData}
                        isLoading={false}
                        pushData={pushData}
                    />
                </InternalIntlWrapper>,
            );

            await user.click(screen.getByLabelText("Delete rule"));

            expect(committedConfig(pushData).suppressedTargets).toEqual([
                { kind: "measure", measureIdentifier: "m1" },
            ]);
        });

        it("does not prune a suppressedTargets entry for a target temporarily absent from the insight itself", async () => {
            const user = userEvent.setup();
            // `insight` (module-level fixture) has no measures bucket at all — m1 isn't a target option
            // here, so its semantic entry being absent from THIS execution says nothing about whether
            // its catalog rule still exists; only d1 (present) is confirmed information.
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [],
                suppressedTargets: [{ kind: "measure", measureIdentifier: "m1" }],
            };
            const pushData = vi.fn();
            render(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={insight}
                        enableSemanticConditionalFormatting
                        targetData={targetData}
                        pushData={pushData}
                    />
                </InternalIntlWrapper>,
            );

            // Toggling d1 (the only real target here) off is the "any other edit" that commits.
            await user.click(screen.getByRole("checkbox", { name: /Turn formatting on\/off/ }));

            expect(committedConfig(pushData).suppressedTargets).toEqual([
                { kind: "measure", measureIdentifier: "m1" },
                { kind: "attribute", attributeIdentifier: "d1" },
            ]);
        });

        it("never writes the semantic conditions themselves into pushData — only the suppressedTargets marker", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const { pushData } = renderWithPushData(targetData, { enabled: true, rules: [] });

            await user.click(toggle());

            expect(JSON.stringify(pushData.mock.calls[0][0])).not.toContain("Direct Sales");
        });

        it("assigns a fresh id instead of persisting the synthetic semantic:<kind>:<localId> placeholder when customizing an inherited target", async () => {
            const user = userEvent.setup();
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
            const { pushData } = renderWithPushData(targetData, { enabled: true, rules: [] });

            await user.click(screen.getByText("Edit rule"));
            await user.click(screen.getByLabelText("Use default rule")); // uncheck: customize
            await user.click(screen.getByText("Save"));

            const next = committedConfig(pushData);
            expect(next.rules).toHaveLength(1);
            expect(next.rules[0].id).not.toBe("semantic:attribute:d1");
            expect(next.rules[0].id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            );
        });
    });

    describe("with insight-level CF (enableConditionalFormatting) off", () => {
        function renderSemanticOnlySection(
            targetData: ICfTargetData | undefined,
            config: IConditionalFormatting | undefined,
        ) {
            return render(
                <InternalIntlWrapper>
                    <ConditionalFormattingSection
                        properties={{ controls: { conditionalFormatting: config } }}
                        propertiesMeta={{ conditionalFormatting_section: { collapsed: false } }}
                        insight={measureAttributeInsight}
                        enableConditionalFormatting={false}
                        enableSemanticConditionalFormatting
                        targetData={targetData}
                        pushData={() => {}}
                    />
                </InternalIntlWrapper>,
            );
        }

        it("hides the master toggle, Add-rule button, and any authored rule list", () => {
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
            };
            renderSemanticOnlySection(targetData, config);

            // The section's own master toggle (not the semantic row's per-target on/off, which is
            // expected to still be there).
            expect(screen.queryByLabelText("conditionalFormatting_section")).not.toBeInTheDocument();
            expect(screen.queryByText("Add")).not.toBeInTheDocument();
            expect(screen.queryByText("Highlight cells or rows that match a rule.")).not.toBeInTheDocument();
        });

        it("still shows the semantic block for a target with no authored rule", () => {
            const targetData: ICfTargetData = { semantic: { d1: SEMANTIC } };
            renderSemanticOnlySection(targetData, { enabled: true, rules: [] });

            expect(screen.getByText("From semantic layer")).toBeInTheDocument();
            expect(screen.getByText("Edit rule")).toBeInTheDocument();
        });

        it("shows the inherited row even for a target with a stale authored rule, since the engine ignores it when this flag is off", () => {
            // Mirrors resolvePerTargetConditionalFormatting: with insightConfig undefined (what the
            // renderer actually passes when enableConditionalFormatting is off), every semantic target
            // resolves as Inherited regardless of what's still sitting in persisted properties.
            const targetData: ICfTargetData = { semantic: { m1: SEMANTIC } };
            const config: IConditionalFormatting = {
                enabled: true,
                rules: [{ id: "r1", target: { kind: "measure", measureIdentifier: "m1" }, conditions: [] }],
            };
            renderSemanticOnlySection(targetData, config);

            expect(screen.getByText("From semantic layer")).toBeInTheDocument();
            expect(screen.getByText("Edit rule")).toBeInTheDocument();
        });
    });
});
