// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "yup";

import { FormMode } from "../../../shared/Form/data.js";
import { FormProvider, type FormProviderComponent } from "../../../shared/Form/Form.js";
import { type ValidationInfo } from "../../../shared/Form/hooks/useFormStatusInternal.js";
import { useFormField } from "../../../shared/Form/useFormField.js";
import { howToCreateMetricLink } from "../../../shared/links.js";
import { mountWithIntlApp, mountWithIntlComponent } from "../../../tests/render.test.utils.js";
import { emptyMetric } from "../../metric/emptyMetric.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { type ValidationSpecialInfo } from "../data.js";
import { TestFormProvider } from "../TestingFormProvider.js";

import { EditMetricContentFooter } from "./EditMetricContentFooter.js";

const Form = FormProvider as FormProviderComponent<IMeasureDef, ValidationSpecialInfo>;

const ORIGINAL = "SELECT 1";

function validator(data: IMeasureDef): ValidationInfo<IMeasureDef, ValidationSpecialInfo> {
    const expression = (data as { expression?: string }).expression ?? "";
    const errors = expression.startsWith("SELECT") ? [] : [new ValidationError("invalid")];
    return {
        loading: false,
        errors,
        critical: errors,
        fields: {} as ValidationInfo<IMeasureDef, ValidationSpecialInfo>["fields"],
        specials: { isEmpty: false, isMaqlEmpty: false },
    };
}

function ExpressionInput() {
    const { value, onChange, element } = useFormField<string, IMeasureDef>("expression" as keyof IMeasureDef);
    return (
        <input
            ref={element as RefObject<HTMLInputElement>}
            aria-label="Metric definition"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function renderFooter() {
    const onSave = vi.fn(() => Promise.resolve());
    const onSaveAs = vi.fn(() => Promise.resolve());
    mountWithIntlApp(
        <Form
            data={{ ...emptyMetric, expression: ORIGINAL } as IMeasureDef}
            mode={FormMode.Edit}
            validator={validator}
            invalidFocus={() => "expression" as keyof IMeasureDef}
            onClose={() => {}}
            onSave={onSave}
            onSaveAs={onSaveAs}
        >
            <>
                <ExpressionInput />
                <EditMetricContentFooter onCancel={() => {}} onDelete={() => {}} />
            </>
        </Form>,
    );
    return { onSave, onSaveAs };
}

const getSave = () => screen.getByRole("button", { name: "Save" });
const getSaveAs = () => screen.getByRole("button", { name: "Save as new" });
const setExpression = (value: string) =>
    fireEvent.change(screen.getByLabelText("Metric definition"), { target: { value } });

describe("EditMetricContentFooter", () => {
    it("announces that the help link opens in a new tab", () => {
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject>
                <EditMetricContentFooter onCancel={vi.fn()} onDelete={vi.fn()} />
            </TestFormProvider>,
        );

        const link = screen.getByRole("link", {
            name: "How to create metrics? (opens in a new tab)",
        });
        expect(link).toHaveAttribute("href", howToCreateMetricLink);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveTextContent("How to create metrics?");
    });

    it("renders Delete as a native button, so Enter and Space activate it like a click", () => {
        const onDelete = vi.fn();
        mountWithIntlComponent(
            <TestFormProvider metric={emptyMetric} canManageProject mode={FormMode.Edit}>
                <EditMetricContentFooter onDelete={onDelete} onCancel={vi.fn()} />
            </TestFormProvider>,
        );

        const button = screen.getByRole("button", { name: "Delete" });

        // a native button turns Enter and Space into a click, an anchor without href does not
        expect(button.tagName).toBe("BUTTON");
        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveClass("s-button-delete");

        fireEvent.click(button);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("exposes Save as disabled when the expression is unchanged", () => {
        const { onSave } = renderFooter();

        expect(getSave()).toHaveAttribute("aria-disabled", "true");
        expect(getSaveAs()).toHaveAttribute("aria-disabled", "false");

        fireEvent.click(getSave());
        expect(onSave).not.toHaveBeenCalled();
    });

    it("enables both buttons after a valid change and disables Save again after reverting", () => {
        renderFooter();

        setExpression("SELECT 999");
        expect(getSave()).toHaveAttribute("aria-disabled", "false");
        expect(getSaveAs()).toHaveAttribute("aria-disabled", "false");

        setExpression(ORIGINAL);
        expect(getSave()).toHaveAttribute("aria-disabled", "true");
    });

    it("exposes both buttons as disabled when the expression is invalid", () => {
        const { onSave, onSaveAs } = renderFooter();

        setExpression("xxx");
        expect(getSave()).toHaveAttribute("aria-disabled", "true");
        expect(getSaveAs()).toHaveAttribute("aria-disabled", "true");

        fireEvent.click(getSave());
        fireEvent.click(getSaveAs());
        expect(onSave).not.toHaveBeenCalled();
        expect(onSaveAs).not.toHaveBeenCalled();
    });

    it.each([
        ["Save", getSave],
        ["Save as new", getSaveAs],
    ])("moves the focus to the invalid field when %s is activated", async (_name, getButton) => {
        renderFooter();

        setExpression("xxx");
        getButton().focus();
        fireEvent.click(getButton());

        await waitFor(() => expect(screen.getByLabelText("Metric definition")).toHaveFocus());
    });
});
