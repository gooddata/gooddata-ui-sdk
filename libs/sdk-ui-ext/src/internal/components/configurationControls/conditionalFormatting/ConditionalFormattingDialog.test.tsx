// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { PointerEventsCheckLevel, userEvent } from "@testing-library/user-event";
import { type Mock, describe, expect, it, vi } from "vitest";

import { type ISemanticConditionalFormatting } from "@gooddata/sdk-model";
import { type IConditionalFormattingRule } from "@gooddata/sdk-ui-pivot/next";

import { InternalIntlWrapper } from "../../../utils/internalIntlProvider.js";

import {
    ConditionalFormattingDialog,
    type IConditionalFormattingDialogProps,
} from "./ConditionalFormattingDialog.js";
import { type ITargetOption } from "./conditionalFormattingModel.js";

const targetOptions: ITargetOption[] = [
    { value: "measure:m1", title: "Amount", target: { kind: "measure", measureIdentifier: "m1" } },
];

const multiTargetOptions: ITargetOption[] = [
    ...targetOptions,
    {
        value: "attribute:a1",
        title: "Category",
        target: { kind: "attribute", attributeIdentifier: "a1" },
    },
];

// A previously saved, complete rule — the state an Edit dialog reopens into.
const completeRule: IConditionalFormattingRule = {
    id: "r1",
    target: { kind: "measure", measureIdentifier: "m1" },
    conditions: [
        {
            id: "c1",
            operator: "LESS_THAN",
            value: { kind: "literal", value: "1000" },
            format: { color: "#E54D40", scope: "cell" },
        },
    ],
};

// userEvent's default `delay: 0` awaits a real macrotask between every keystroke/click, which
// dominates the runtime of this file; nothing under test is debounced, so drop the wait entirely.
// `pointerEventsCheck: Never` skips userEvent's per-call getComputedStyle walk up the tree, which is
// one of the most expensive operations in jsdom. Nothing here asserts disabled-ness via
// pointer-events — the kit Button uses aria-disabled — so the check buys these tests nothing.
const setupUser = () => userEvent.setup({ delay: null, pointerEventsCheck: PointerEventsCheckLevel.Never });

// The kit Button conveys disabled via aria-disabled, not the native attribute.
const saveButton = () => screen.getByText("Save").closest("button");
const isSaveDisabled = () => saveButton()?.getAttribute("aria-disabled") === "true";

function renderDialog(props: Partial<IConditionalFormattingDialogProps> = {}) {
    const onSave = vi.fn<IConditionalFormattingDialogProps["onSave"]>();
    render(
        <InternalIntlWrapper>
            <ConditionalFormattingDialog
                rule={completeRule}
                isNew={false}
                targetOptions={targetOptions}
                alignTo="body"
                onSave={onSave}
                onClose={() => {}}
                {...props}
            />
        </InternalIntlWrapper>,
    );
    return { onSave };
}

describe("ConditionalFormattingDialog — Save dirty gating", () => {
    it("disables Save when reopening an unchanged complete rule (F1-2606)", () => {
        renderDialog({ isNew: false });
        expect(isSaveDisabled()).toBe(true);
    });

    it("enables Save once the reopened rule is modified", async () => {
        const user = setupUser();
        renderDialog({ isNew: false });
        expect(isSaveDisabled()).toBe(true);

        await user.click(screen.getByText("Add condition"));
        expect(isSaveDisabled()).toBe(false);
    });

    it("enables Save immediately for a new complete rule (no change required)", () => {
        renderDialog({ isNew: true });
        expect(isSaveDisabled()).toBe(false);
    });
});

describe("ConditionalFormattingDialog — measure threshold input (F1-2738)", () => {
    const valueInput = () => screen.getByPlaceholderText("Value");

    const emptyRule: IConditionalFormattingRule = {
        ...completeRule,
        conditions: [{ ...completeRule.conditions[0], value: { kind: "literal", value: "" } }],
    };

    const savedThreshold = (onSave: Mock<IConditionalFormattingDialogProps["onSave"]>) => {
        const value = onSave.mock.calls[0][0].conditions[0].value;
        if (value.kind !== "literal") {
            throw new Error(`expected a literal condition value, got "${value.kind}"`);
        }
        return value.value;
    };

    it.each([
        ["1.23e+9", 1230000000],
        ["1e308", 1e308],
        ["1.23e-9", 1.23e-9],
    ])(
        "accepts the scientific-notation threshold %s and saves it in raw numeric space",
        async (typed, expected) => {
            const user = setupUser();
            const { onSave } = renderDialog({ rule: emptyRule, isNew: true });
            expect(isSaveDisabled()).toBe(true);

            await user.type(valueInput(), typed);
            expect(isSaveDisabled()).toBe(false);

            await user.click(screen.getByText("Save"));
            expect(savedThreshold(onSave)).toBe(expected);
        },
    );

    it("never saves a non-finite threshold when the exponent overflows", async () => {
        const user = setupUser();
        const { onSave } = renderDialog({ rule: emptyRule, isNew: true });

        await user.type(valueInput(), "1e309");
        await user.click(screen.getByText("Save"));

        expect(Number.isFinite(savedThreshold(onSave))).toBe(true);
    });
});

describe("ConditionalFormattingDialog — fixedTarget header", () => {
    it("renders a static target row instead of a dropdown when fixedTarget is set", () => {
        renderDialog({ targetOptions, fixedTarget: true });
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(document.querySelector(".gd-cf-dialog__target-picker")).not.toBeInTheDocument();
    });

    it("renders the target dropdown when fixedTarget is not set, regardless of option count", () => {
        renderDialog({ targetOptions });
        expect(document.querySelector(".gd-cf-dialog__target-picker")).toBeInTheDocument();
    });

    it("renders the target dropdown when multiple target options exist", () => {
        renderDialog({ targetOptions: multiTargetOptions });
        expect(document.querySelector(".gd-cf-dialog__target-picker")).toBeInTheDocument();
    });

    it("renders the dropdown, not a static row, when fixedTarget is set but the rule's target no longer matches any option", () => {
        const staleRule: IConditionalFormattingRule = {
            ...completeRule,
            target: { kind: "measure", measureIdentifier: "removed-measure" },
        };
        renderDialog({ targetOptions, rule: staleRule, fixedTarget: true });
        expect(document.querySelector(".gd-cf-dialog__target-picker")).toBeInTheDocument();
    });
});

describe("ConditionalFormattingDialog — Use default rule (semantic fallback)", () => {
    const semantic: ISemanticConditionalFormatting = {
        conditions: [
            {
                id: "sc1",
                operator: "GREATER_THAN",
                value: { kind: "literal", value: "500" },
                format: { color: "#123456", scope: "cell" },
            },
        ],
    };
    const semanticByTarget: Record<string, ISemanticConditionalFormatting> = { m1: semantic };
    const semanticRule: IConditionalFormattingRule = {
        id: "semantic:measure:m1",
        target: { kind: "measure", measureIdentifier: "m1" },
        conditions: semantic.conditions,
    };
    // What the "+ Add" button's blank flow opens with (see `newRule` in conditionalFormattingModel.ts)
    // when targetOptions[0] happens to be a target with a semantic entry.
    const newBlankRuleAtSemanticTarget: IConditionalFormattingRule = {
        id: "new-blank",
        target: { kind: "measure", measureIdentifier: "m1" },
        conditions: [{ id: "c1", operator: "ALL", value: { kind: "none" }, format: { scope: "cell" } }],
    };

    function renderInherited(props: Partial<IConditionalFormattingDialogProps> = {}) {
        const onSave = vi.fn<IConditionalFormattingDialogProps["onSave"]>();
        const onDelete = vi.fn();
        const onRevertToDefault = vi.fn();
        const onClose = vi.fn();
        render(
            <InternalIntlWrapper>
                <ConditionalFormattingDialog
                    rule={semanticRule}
                    isNew
                    // Matches the real semantic-row entry point's wiring (fixedTarget={kind ===
                    // "semantic"}); irrelevant once a test overrides isNew: false (an existing
                    // custom rule via RuleChip, always fixedTarget: false in production) since
                    // activeSemantic's isNew && !fixedTarget gate short-circuits on isNew alone.
                    fixedTarget
                    targetOptions={targetOptions}
                    alignTo="body"
                    semanticByTarget={semanticByTarget}
                    onSave={onSave}
                    onDelete={onDelete}
                    onRevertToDefault={onRevertToDefault}
                    onClose={onClose}
                    {...props}
                />
            </InternalIntlWrapper>,
        );
        return { onSave, onDelete, onRevertToDefault, onClose };
    }

    const checkbox = () => screen.getByLabelText("Use default rule");
    const deleteButton = () => screen.getByLabelText("Delete rule");

    it("does not render the checkbox when the target has no semantic entry", () => {
        renderDialog();
        expect(screen.queryByText("Use default rule")).not.toBeInTheDocument();
    });

    it("renders the checkbox, checked, for an Inherited (isNew) target with a semantic entry", () => {
        renderInherited();
        expect(checkbox()).toBeChecked();
    });

    it("titles the dialog plain 'Rule' whenever a semantic entry exists, checked or not", async () => {
        const user = setupUser();
        renderInherited();
        expect(document.querySelector(".gd-cf-dialog__title")).toHaveTextContent("Rule");

        await user.click(checkbox());
        expect(document.querySelector(".gd-cf-dialog__title")).toHaveTextContent("Rule");
    });

    it("locks fields, hides Add condition, and disables the delete button while checked", () => {
        renderInherited();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", true);
        expect(screen.queryByText("Add condition")).not.toBeInTheDocument();
        expect(deleteButton()).toBeDisabled();
    });

    it("shows a disabled delete button from its own isNew/fixedTarget state even when the caller passes no onDelete at all", () => {
        // The caller (Section) only passes a real onDelete when there's an actual authored rule to
        // delete — a semantic view with nothing authored yet gets none. The dialog must still render
        // the disabled-with-tooltip affordance itself, not rely on onDelete's mere presence to do so.
        renderInherited({ onDelete: undefined });
        expect(deleteButton()).toBeDisabled();
    });

    it("keeps the delete button disabled even for an existing rule if the caller omits onDelete", () => {
        // Defensive: `isNew: false` alone must not enable a button with nothing real behind it.
        renderInherited({ rule: completeRule, isNew: false, onDelete: undefined });
        expect(deleteButton()).toBeDisabled();
    });

    it("unlocks fields and shows Add condition once unchecked", async () => {
        const user = setupUser();
        renderInherited();

        await user.click(checkbox());
        expect(checkbox()).not.toBeChecked();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
        expect(screen.getByText("Add condition")).toBeInTheDocument();
    });

    it("reseeds the draft from the live semantic value (not a stale `rule` prop) when unchecked", async () => {
        // Simulates a fresher semantic payload having arrived after this dialog's `rule` prop was
        // captured (e.g. a new data view landed while the dialog sat open, checked) — the fields
        // are locked the whole time it's checked, so nothing the user typed can be lost; unchecking
        // should start the edit from what's actually current, not whatever `rule` still holds.
        const user = setupUser();
        const staleRule: IConditionalFormattingRule = {
            ...semanticRule,
            conditions: [
                {
                    id: "stale",
                    operator: "EQUAL_TO",
                    value: { kind: "literal", value: "999" },
                    format: { color: "#000000", scope: "cell" },
                },
            ],
        };
        renderInherited({ rule: staleRule });

        await user.click(checkbox());
        expect(screen.getByDisplayValue("500")).toBeInTheDocument();
        expect(screen.queryByDisplayValue("999")).not.toBeInTheDocument();
    });

    it("sanitizes the live semantic conditions when seeding the draft, so an unsupported operator doesn't dead-end editing", async () => {
        // CONTAINS is valid for an attribute but not a measure — a semantic rule authored elsewhere
        // (e.g. AAC) could still carry it against a measure target. sanitizeRuleForEditing already
        // handles this for every other entry point; the reseed-on-uncheck path must go through it too.
        const user = setupUser();
        const unsupportedSemantic: Record<string, ISemanticConditionalFormatting> = {
            m1: {
                conditions: [
                    {
                        id: "bad",
                        operator: "CONTAINS",
                        value: { kind: "literal", value: "foo" },
                        format: { color: "#123456", scope: "cell" },
                    },
                ],
            },
        };
        renderInherited({ semanticByTarget: unsupportedSemantic });

        await user.click(checkbox());
        expect(screen.getByText("Equal to")).toBeInTheDocument();
        expect(screen.queryByText("Contains")).not.toBeInTheDocument();
    });

    it("does not clobber the user's own edit when re-checking then unchecking again", async () => {
        const user = setupUser();
        renderInherited();

        await user.click(checkbox()); // uncheck: seeds "500" from the semantic value
        const valueInput = screen.getByDisplayValue("500");
        await user.clear(valueInput);
        await user.type(valueInput, "777");
        await user.click(checkbox()); // check: preview the default again (fields lock)
        await user.click(checkbox()); // uncheck again: must restore "777", not reseed "500"

        expect(screen.getByDisplayValue("777")).toBeInTheDocument();
        expect(screen.queryByDisplayValue("500")).not.toBeInTheDocument();
    });

    it("keeps the target picker enabled and doesn't lock in the blank Add-Rule flow, even when the default target has a semantic entry", () => {
        // isNew + no fixedTarget = the "+ Add" flow's blank rule, whatever target happens to be
        // first in targetOptions. The checkbox/lock mechanism must not engage there — the user still
        // needs to pick a target, and there's no existing draft yet for "Use default" to describe.
        renderInherited({ rule: newBlankRuleAtSemanticTarget, fixedTarget: false });

        expect(screen.queryByText("Use default rule")).not.toBeInTheDocument();
        expect(document.querySelector(".gd-cf-dialog__target-picker")).toHaveProperty("disabled", false);
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
    });

    it("Save while checked (nothing authored yet) just closes, without calling onSave or onRevertToDefault", async () => {
        const user = setupUser();
        const { onSave, onRevertToDefault, onClose } = renderInherited();

        await user.click(screen.getByText("Save"));
        expect(onSave).not.toHaveBeenCalled();
        expect(onRevertToDefault).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("Save while unchecked persists the draft via onSave", async () => {
        const user = setupUser();
        const { onSave } = renderInherited();

        await user.click(checkbox());
        await user.click(screen.getByText("Save"));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ target: semanticRule.target }));
    });

    it("defaults unchecked when editing an existing custom rule that also has a semantic fallback", () => {
        renderInherited({ rule: completeRule, isNew: false });
        expect(checkbox()).not.toBeChecked();
    });

    it("re-checking an existing custom rule's box and saving reverts it via onRevertToDefault (not onDelete)", async () => {
        const user = setupUser();
        const { onSave, onDelete, onRevertToDefault, onClose } = renderInherited({
            rule: completeRule,
            isNew: false,
        });

        await user.click(checkbox());
        await user.click(screen.getByText("Save"));
        expect(onRevertToDefault).toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expect(onSave).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("enables the delete button for an existing custom rule with a semantic fallback", () => {
        renderInherited({ rule: completeRule, isNew: false });
        expect(deleteButton()).toBeEnabled();
    });

    it("calls onRevertToDefault with the current target and this rule's own id", async () => {
        const user = setupUser();
        const { onRevertToDefault } = renderInherited({ rule: completeRule, isNew: false });

        await user.click(checkbox());
        await user.click(screen.getByText("Save"));

        expect(onRevertToDefault).toHaveBeenCalledWith(semanticRule.target, completeRule.id);
    });

    it("still calls onRevertToDefault when the caller omits onDelete — they are independent optional props", async () => {
        const user = setupUser();
        const { onRevertToDefault } = renderInherited({
            rule: completeRule,
            isNew: false,
            onDelete: undefined,
        });

        await user.click(checkbox());
        await user.click(screen.getByText("Save"));

        expect(onRevertToDefault).toHaveBeenCalledWith(semanticRule.target, completeRule.id);
    });

    it("unlocks and falls back to the rule's own conditions if the semantic fallback disappears while checked", async () => {
        // A race (the catalog rule deleted elsewhere, a data-view blip) rather than a normal flow —
        // covers that the checkbox vanishing doesn't leave fields silently locked with no way out.
        const user = setupUser();
        const onSave = vi.fn<IConditionalFormattingDialogProps["onSave"]>();
        const onRevertToDefault = vi.fn();
        const onClose = vi.fn();
        const { rerender } = render(
            <InternalIntlWrapper>
                <ConditionalFormattingDialog
                    rule={completeRule}
                    isNew={false}
                    fixedTarget
                    targetOptions={targetOptions}
                    alignTo="body"
                    semanticByTarget={semanticByTarget}
                    onSave={onSave}
                    onRevertToDefault={onRevertToDefault}
                    onClose={onClose}
                />
            </InternalIntlWrapper>,
        );

        await user.click(checkbox());
        rerender(
            <InternalIntlWrapper>
                <ConditionalFormattingDialog
                    rule={completeRule}
                    isNew={false}
                    fixedTarget
                    targetOptions={targetOptions}
                    alignTo="body"
                    semanticByTarget={{}}
                    onSave={onSave}
                    onRevertToDefault={onRevertToDefault}
                    onClose={onClose}
                />
            </InternalIntlWrapper>,
        );

        expect(screen.queryByText("Use default rule")).not.toBeInTheDocument();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
        expect(screen.getByPlaceholderText("Value")).toHaveValue("1,000");
    });

    it("does not re-lock and discard an edit made while unlocked once the vanished semantic fallback reappears", async () => {
        const user = setupUser();
        const onSave = vi.fn<IConditionalFormattingDialogProps["onSave"]>();
        const onRevertToDefault = vi.fn();
        const onClose = vi.fn();
        const dialogProps = (semantic: Record<string, ISemanticConditionalFormatting>) => (
            <InternalIntlWrapper>
                <ConditionalFormattingDialog
                    rule={completeRule}
                    isNew={false}
                    fixedTarget
                    targetOptions={targetOptions}
                    alignTo="body"
                    semanticByTarget={semantic}
                    onSave={onSave}
                    onRevertToDefault={onRevertToDefault}
                    onClose={onClose}
                />
            </InternalIntlWrapper>
        );
        const { rerender } = render(dialogProps(semanticByTarget));

        await user.click(checkbox());
        rerender(dialogProps({}));

        const valueInput = screen.getByPlaceholderText("Value");
        await user.clear(valueInput);
        await user.type(valueInput, "42");

        // The default reappears while the user has an unsaved edit sitting in the now-unlocked fields.
        rerender(dialogProps(semanticByTarget));

        expect(checkbox()).not.toBeChecked();
        expect(document.querySelector(".gd-cf-dialog__editable")).toHaveProperty("disabled", false);
        expect(screen.getByDisplayValue("42")).toBeInTheDocument();

        await user.click(screen.getByText("Save"));
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: completeRule.id }));
        expect(onRevertToDefault).not.toHaveBeenCalled();
    });

    it("has a keyboard-focusable info affordance next to the checkbox (a real button, not a bare span)", () => {
        renderInherited();
        const info = document.querySelector(".gd-cf-dialog__use-default-info");
        expect(info?.tagName).toBe("BUTTON");
        expect(info?.getAttribute("aria-label")).toBe(
            "Use the default rule for this item. Turn off this option to override the default rule.",
        );
    });
});
