// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
    type IConditionalFormattingCondition,
    type IConditionalFormattingRule,
} from "@gooddata/sdk-ui-pivot/next";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import { ConditionalFormattingDialog } from "../ConditionalFormattingDialog.js";
import { type ITargetOption } from "../conditionalFormattingModel.js";

const targetOptions: ITargetOption[] = [
    { value: "measure:m1", title: "Amount", target: { kind: "measure", measureIdentifier: "m1" } },
    {
        value: "measure:m2",
        title: "Win rate",
        target: { kind: "measure", measureIdentifier: "m2" },
        isPercent: true,
    },
    {
        value: "attribute:a1",
        title: "Status",
        target: { kind: "attribute", attributeIdentifier: "a1" },
        elements: ["Won", "Lost"],
    },
    {
        value: "attribute:d1",
        title: "Created",
        target: { kind: "attribute", attributeIdentifier: "d1" },
        date: { granularity: "GDC.time.date" },
    },
];

const condition = (overrides: Partial<IConditionalFormattingCondition>): IConditionalFormattingCondition => ({
    id: "c1",
    operator: "LESS_THAN",
    value: { kind: "literal", value: "" },
    format: { color: "#E54D40", scope: "cell" },
    ...overrides,
});

const rule = (
    target: IConditionalFormattingRule["target"],
    conditionOverrides: Partial<IConditionalFormattingCondition>,
): IConditionalFormattingRule => ({
    id: "r1",
    target,
    conditions: [condition(conditionOverrides)],
});

const MEASURE: IConditionalFormattingRule["target"] = { kind: "measure", measureIdentifier: "m1" };
const ATTRIBUTE: IConditionalFormattingRule["target"] = { kind: "attribute", attributeIdentifier: "a1" };
const DATE: IConditionalFormattingRule["target"] = { kind: "attribute", attributeIdentifier: "d1" };

function renderDialog(rule: IConditionalFormattingRule) {
    render(
        <InternalIntlWrapper>
            <ConditionalFormattingDialog
                rule={rule}
                isNew
                targetOptions={targetOptions}
                alignTo="body"
                onSave={() => {}}
                onClose={() => {}}
            />
        </InternalIntlWrapper>,
    );
}

// `hidden: true` because the Overlay starts out visibility: hidden — without it these queries match
// nothing and the negative assertions pass for the wrong reason.
const alert = () => screen.queryByRole("alert", { hidden: true });
const errorText = () => alert()?.textContent;
// The kit Button conveys disabled via aria-disabled, not the native attribute.
const isSaveDisabled = () =>
    screen.getByText("Save").closest("button")?.getAttribute("aria-disabled") === "true";
// The red border lives on InputPure's wrapping label, the accessible state on the input itself.
const inputHasError = (input: HTMLElement) => input.closest(".gd-input")?.classList.contains("has-error");

const EMPTY_ERROR = "Error: Value cannot be empty.";

describe("ConditionalFormattingDialog — empty condition value (F1-2733)", () => {
    it("shows no error before the value input is visited", () => {
        renderDialog(rule(MEASURE, { operator: "LESS_THAN" }));

        expect(alert()).toBeNull();
        expect(isSaveDisabled()).toBe(true);
    });

    it("shows the inline error when a measure threshold is left empty on blur", async () => {
        const user = userEvent.setup();
        renderDialog(rule(MEASURE, { operator: "LESS_THAN" }));
        const input = screen.getByPlaceholderText("Value");

        await user.click(input);
        await user.tab();

        expect(errorText()).toBe(EMPTY_ERROR);
        expect(inputHasError(input)).toBe(true);
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe(alert()?.id);
    });

    it("shows the inline error when an attribute text value is left empty on blur", async () => {
        const user = userEvent.setup();
        renderDialog(rule(ATTRIBUTE, { operator: "NOT_ENDS_WITH" }));
        const input = screen.getByPlaceholderText("Value");

        await user.click(input);
        await user.tab();

        expect(errorText()).toBe(EMPTY_ERROR);
        expect(inputHasError(input)).toBe(true);
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe(alert()?.id);
    });

    it("shows the inline error when an attribute suggestion combobox is left empty on blur", async () => {
        const user = userEvent.setup();
        renderDialog(rule(ATTRIBUTE, { operator: "EQUAL_TO" }));
        const input = screen.getByPlaceholderText("Value");
        expect(input.getAttribute("role")).toBe("combobox");

        await user.click(input);
        await user.tab();

        expect(errorText()).toBe(EMPTY_ERROR);
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe(alert()?.id);
    });

    it("clears the error as soon as a value is entered", async () => {
        const user = userEvent.setup();
        renderDialog(rule(MEASURE, { operator: "LESS_THAN" }));
        const input = screen.getByPlaceholderText("Value");

        await user.click(input);
        await user.tab();
        expect(errorText()).toBe(EMPTY_ERROR);

        await user.type(input, "42");

        expect(alert()).toBeNull();
        expect(inputHasError(input)).toBe(false);
        expect(isSaveDisabled()).toBe(false);
    });

    it("marks only the range bound that was left empty", async () => {
        const user = userEvent.setup();
        renderDialog(
            rule(MEASURE, { operator: "BETWEEN", value: { kind: "literalRange", from: NaN, to: NaN } }),
        );
        const from = screen.getByPlaceholderText("From");
        const to = screen.getByPlaceholderText("To");

        await user.type(from, "10");
        await user.click(to);
        await user.tab();

        expect(errorText()).toBe(EMPTY_ERROR);
        expect(inputHasError(to)).toBe(true);
        expect(inputHasError(from)).toBe(false);
    });

    it("keeps the range order error taking precedence once both bounds are filled", async () => {
        const user = userEvent.setup();
        renderDialog(
            rule(MEASURE, { operator: "BETWEEN", value: { kind: "literalRange", from: NaN, to: NaN } }),
        );
        const from = screen.getByPlaceholderText("From");
        const to = screen.getByPlaceholderText("To");

        await user.type(from, "10");
        await user.type(to, "5");
        await user.tab();

        expect(errorText()).toBe("Error: “From” must be less than or equal to “To”.");
        expect(inputHasError(from)).toBe(true);
        expect(inputHasError(to)).toBe(true);
    });

    it("drops the error when the operator switches to a different value editor", async () => {
        const user = userEvent.setup();
        renderDialog(rule(MEASURE, { operator: "LESS_THAN" }));

        await user.click(screen.getByPlaceholderText("Value"));
        await user.tab();
        expect(errorText()).toBe(EMPTY_ERROR);

        await user.click(screen.getByText("Less than"));
        await user.click(screen.getByText("Between"));

        expect(alert()).toBeNull();
    });

    // Deliberate: the field was visited, and a retarget across the percent boundary clears its value
    // (ruleWithTarget). Surfacing the error is what explains the Save button going disabled.
    it("keeps the error on a visited field whose value a retarget clears", async () => {
        const user = userEvent.setup();
        renderDialog(rule(MEASURE, { operator: "LESS_THAN" }));

        await user.type(screen.getByPlaceholderText("Value"), "42");
        await user.tab();
        expect(alert()).toBeNull();
        expect(isSaveDisabled()).toBe(false);

        await user.click(screen.getByText("Amount"));
        await user.click(screen.getByText("Win rate"));

        expect(errorText()).toBe(EMPTY_ERROR);
        expect(isSaveDisabled()).toBe(true);
    });

    it("shows the inline error when the date picker is closed without choosing a period", async () => {
        const user = userEvent.setup();
        renderDialog(rule(DATE, { operator: "EQUAL_TO", value: { kind: "none" } }));

        await user.click(screen.getByText("Select period"));
        await user.keyboard("{Escape}");

        expect(errorText()).toBe(EMPTY_ERROR);
    });
});
