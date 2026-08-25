// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { PointerEventsCheckLevel, userEvent } from "@testing-library/user-event";
import { type Mock, describe, expect, it, vi } from "vitest";

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

const multiConditionRule: IConditionalFormattingRule = {
    ...completeRule,
    conditions: [
        ...completeRule.conditions,
        {
            id: "c2",
            operator: "GREATER_THAN",
            value: { kind: "literal", value: "2000" },
            format: { color: "#00FF00", scope: "cell" },
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

describe("ConditionalFormattingDialog — readOnly mode", () => {
    it("does not render a Save button", () => {
        renderDialog({ readOnly: true });
        expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });

    it("titles itself 'View rule', not 'Edit rule', regardless of isNew", () => {
        renderDialog({ readOnly: true, isNew: false });
        expect(document.querySelector(".gd-cf-dialog__title")).toHaveTextContent("View rule");
        renderDialog({ readOnly: true, isNew: true });
        expect(screen.getAllByText("View rule").length).toBeGreaterThan(0);
        expect(screen.queryByText("Edit rule")).not.toBeInTheDocument();
        expect(screen.queryByText("Add rule")).not.toBeInTheDocument();
    });

    it("keeps the Cancel button and close icon interactive", () => {
        renderDialog({ readOnly: true });
        expect(screen.getByText("Cancel").closest("button")).toBeEnabled();
    });

    it("disables the conditions editable region without hiding it from assistive tech", () => {
        renderDialog({ readOnly: true });
        const editable = document.querySelector(".gd-cf-dialog__editable");
        expect(editable).toHaveProperty("disabled", true);
        expect(editable).toBeInTheDocument();
        expect(screen.getByText("Condition")).toBeInTheDocument();
    });

    it("leaves the conditions editable region enabled when not readOnly", () => {
        renderDialog({ readOnly: false });
        const editable = document.querySelector(".gd-cf-dialog__editable");
        expect(editable).toHaveProperty("disabled", false);
    });

    it("disables the target picker when multiple targets exist", () => {
        renderDialog({ readOnly: true, targetOptions: multiTargetOptions });
        const picker = document.querySelector(".gd-cf-dialog__target-picker");
        expect(picker).toHaveProperty("disabled", true);
    });

    it("does not make condition rows draggable, since a disabled fieldset alone would not stop drag-and-drop", () => {
        renderDialog({ readOnly: true, rule: multiConditionRule });
        const rows = document.querySelectorAll(".gd-cf-condition");
        expect(rows.length).toBe(2);
        rows.forEach((row) => expect(row).not.toHaveAttribute("draggable"));
    });

    it("marks the per-condition delete button with the class the readonly modifier hides", () => {
        renderDialog({ readOnly: true, rule: multiConditionRule });
        expect(document.querySelector(".gd-cf-dialog__editable--readonly")).toBeInTheDocument();
        expect(
            document.querySelector(".gd-cf-dialog__editable--readonly .gd-cf-condition__delete"),
        ).toBeInTheDocument();
    });

    it("preserves a stored condition the editor cannot represent instead of blanking it (F1-2754)", () => {
        const dateTargetOptions: ITargetOption[] = [
            {
                value: "attribute:a1",
                title: "Created",
                target: { kind: "attribute", attributeIdentifier: "a1" },
                date: { granularity: "GDC.time.date" },
            },
        ];
        // CONTAINS is not a valid date operator — sanitizeRuleForEditing would normally force it to
        // EQUAL_TO with an empty value, hiding the actual stored date range from view.
        const unsupportedDateRule: IConditionalFormattingRule = {
            id: "r-date",
            target: { kind: "attribute", attributeIdentifier: "a1" },
            conditions: [
                {
                    id: "c1",
                    operator: "CONTAINS",
                    value: { kind: "absoluteDate", from: "2024-01-01", to: "2024-01-31" },
                    format: { color: "#E54D40", scope: "cell" },
                },
            ],
        };
        renderDialog({ readOnly: true, targetOptions: dateTargetOptions, rule: unsupportedDateRule });
        expect(screen.queryByText("Select period")).not.toBeInTheDocument();
        expect(screen.getByText("Contains")).toBeInTheDocument();
    });

    it("falls back to raw text when the stored value doesn't fit the target's editor (F1-2754)", () => {
        // A measure's value editor only knows how to display numeric literals; CONTAINS with a
        // non-numeric literal is a shape the pivot editor never authors for a measure target.
        const mismatchedRule: IConditionalFormattingRule = {
            id: "r-mismatch",
            target: { kind: "measure", measureIdentifier: "m1" },
            conditions: [
                {
                    id: "c1",
                    operator: "CONTAINS",
                    value: { kind: "literal", value: "foo" },
                    format: { color: "#E54D40", scope: "cell" },
                },
            ],
        };
        renderDialog({ readOnly: true, rule: mismatchedRule });
        expect(screen.getByText("foo")).toBeInTheDocument();
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
