// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { type Mock, describe, expect, it, vi } from "vitest";

import { type IConditionalFormattingRule } from "@gooddata/sdk-ui-pivot/next";

import { InternalIntlWrapper } from "../../../../utils/internalIntlProvider.js";
import {
    ConditionalFormattingDialog,
    type IConditionalFormattingDialogProps,
} from "../ConditionalFormattingDialog.js";
import { type ITargetOption } from "../conditionalFormattingModel.js";

const targetOptions: ITargetOption[] = [
    { value: "measure:m1", title: "Amount", target: { kind: "measure", measureIdentifier: "m1" } },
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
        const user = userEvent.setup();
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
            const user = userEvent.setup();
            const { onSave } = renderDialog({ rule: emptyRule, isNew: true });
            expect(isSaveDisabled()).toBe(true);

            await user.type(valueInput(), typed);
            expect(isSaveDisabled()).toBe(false);

            await user.click(screen.getByText("Save"));
            expect(savedThreshold(onSave)).toBe(expected);
        },
    );

    it("never saves a non-finite threshold when the exponent overflows", async () => {
        const user = userEvent.setup();
        const { onSave } = renderDialog({ rule: emptyRule, isNew: true });

        await user.type(valueInput(), "1e309");
        await user.click(screen.getByText("Save"));

        expect(Number.isFinite(savedThreshold(onSave))).toBe(true);
    });
});
