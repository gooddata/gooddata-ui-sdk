// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
    const onSave = vi.fn();
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
