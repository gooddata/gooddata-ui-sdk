// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiInlineTextGeneratorResult, UiInlineTextGenerator } from "../UiInlineTextGenerator.js";

function renderUiInlineTextGenerator({
    onGenerate,
    onSubmit,
}: {
    onGenerate: () => Promise<IUiInlineTextGeneratorResult>;
    onSubmit: (value: string) => void;
}) {
    function TestComponent() {
        const [value, setValue] = useState("Initial value");

        return (
            <UiInlineTextGenerator
                value={value}
                onSubmit={(nextValue) => {
                    setValue(nextValue);
                    onSubmit(nextValue);
                }}
                onGenerate={onGenerate}
                ariaLabel="Description"
                generateButtonLabel="Generate"
                undoButtonLabel="Undo"
            >
                {value}
            </UiInlineTextGenerator>
        );
    }

    render(<TestComponent />);
}

describe("UiInlineTextGenerator", () => {
    it("keeps generate visible with history and undoes generated states in reverse order", async () => {
        const onSubmit = vi.fn();
        const onGenerate = vi
            .fn<() => Promise<IUiInlineTextGeneratorResult>>()
            .mockResolvedValueOnce({ text: "Generated value 1" })
            .mockResolvedValueOnce({ text: "Generated value 2" });

        renderUiInlineTextGenerator({ onGenerate, onSubmit });

        fireEvent.click(screen.getByTestId("editable-label"));
        expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Generate" }), { detail: 0 });
        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith("Generated value 1");
        });

        fireEvent.click(screen.getByTestId("editable-label"));
        expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Generate" }), { detail: 0 });
        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith("Generated value 2");
        });

        fireEvent.click(screen.getByTestId("editable-label"));
        fireEvent.click(screen.getByRole("button", { name: "Undo" }), { detail: 0 });
        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith("Generated value 1");
        });

        fireEvent.click(screen.getByTestId("editable-label"));
        expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Generate" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Undo" }), { detail: 0 });
        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith("Initial value");
        });

        fireEvent.click(screen.getByTestId("editable-label"));
        expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    });
});
