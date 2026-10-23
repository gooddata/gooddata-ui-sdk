// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { isEmpty } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { passOnlyValidOrEmpty } from "../Header/MetricIdField.js";

import { InlineEditableValue } from "./InlineEditableValue.js";

function IdHarness({ initial = "" }: { initial?: string }) {
    const [value, setValue] = useState(initial);
    return (
        <InlineEditableValue
            size="small"
            minWidth={64}
            prefix="acme."
            placeholder="generated_id"
            ariaLabel="Metric ID"
            onChangeValueTransformer={passOnlyValidOrEmpty}
            onEditEndsValueTransformer={(v) => (isEmpty(v.trim()) ? "generated_id" : v.trim())}
            value={value}
            onChange={setValue}
        />
    );
}

/** Type one character at a time, the way a user does. */
function typeInto(input: HTMLInputElement, text: string) {
    for (const ch of text) {
        fireEvent.change(input, { target: { value: input.value + ch } });
    }
}

describe("InlineEditableValue", () => {
    it("accepts typed characters into an empty id", () => {
        render(<IdHarness />);
        const input = screen.getByLabelText<HTMLInputElement>("Metric ID");

        typeInto(input, "my_metric");

        expect(input.value).toBe("my_metric");
    });

    it("accepts typing appended to an existing id", () => {
        render(<IdHarness initial="orders" />);
        const input = screen.getByLabelText<HTMLInputElement>("Metric ID");

        typeInto(input, "_2");

        expect(input.value).toBe("orders_2");
    });

    it("rejects a character the id pattern forbids", () => {
        render(<IdHarness initial="orders" />);
        const input = screen.getByLabelText<HTMLInputElement>("Metric ID");

        typeInto(input, "@");

        expect(input.value).toBe("orders");
    });

    it("reports a blur it did not change, without committing", () => {
        const onChange = vi.fn();
        const onBlur = vi.fn();
        render(
            <InlineEditableValue value="orders" ariaLabel="Metric ID" onChange={onChange} onBlur={onBlur} />,
        );
        const input = screen.getByLabelText("Metric ID");

        fireEvent.focus(input);
        fireEvent.blur(input);

        // Reporting marks the field touched, which is what surfaces its validation error.
        // Committing would mark it edited and stop a generated id following the title.
        expect(onBlur).toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });

    it("shows an error once the user is at the field", () => {
        render(
            <InlineEditableValue
                value=""
                ariaLabel="Value"
                showError
                errorMessage="Name is required"
                onChange={() => {}}
            />,
        );
        // A permanent bubble under an untouched field is noise; validation focuses the field
        // it rejected, so a failed save still surfaces this.
        expect(screen.queryByText("Name is required")).toBeNull();

        fireEvent.focus(screen.getByLabelText("Value"));

        expect(screen.getByText("Name is required")).toBeDefined();
    });

    it("keeps a warning until the user is at the field", () => {
        render(
            <InlineEditableValue
                value="dupe"
                ariaLabel="Value"
                showWarning
                warningMessage="This name already exists"
                onChange={() => {}}
            />,
        );
        expect(screen.queryByText("This name already exists")).toBeNull();

        fireEvent.focus(screen.getByLabelText("Value"));

        expect(screen.getByText("This name already exists")).toBeDefined();
    });

    it("commits the transformed value on blur when it differs", () => {
        const onChange = vi.fn();
        render(
            <InlineEditableValue
                value="  orders  "
                ariaLabel="Metric ID"
                onEditEndsValueTransformer={(v) => v.trim()}
                onChange={onChange}
            />,
        );
        const input = screen.getByLabelText("Metric ID");

        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith("orders");
    });
});
