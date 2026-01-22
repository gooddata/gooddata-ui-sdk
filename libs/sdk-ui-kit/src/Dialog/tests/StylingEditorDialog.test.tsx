// (C) 2022-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import {
    type IStylingEditorDialogProps,
    type IStylingPickerItem,
    StylingEditorDialog,
} from "../StylingEditorDialog/StylingEditorDialog.js";

describe("Styling editor dialog", () => {
    const theme = (color: string): IStylingPickerItem<ITheme> => {
        return {
            name: `Theme ${color}`,
            content: {
                palette: {
                    primary: {
                        base: color,
                    },
                },
            },
        };
    };

    const referenceTheme = (color: string) => JSON.stringify(theme(color).content, null, 4);

    const renderEditor = (customProps: Partial<IStylingEditorDialogProps<ITheme>> = {}) => {
        const defaultProps = {
            title: "Dialog title",
            link: {
                text: "Link description.",
                url: "#",
            },
            tooltip: "Tooltip to describe examples usage.",
            stylingItem: theme("red"),
            examples: [theme("green"), theme("blue")],
            exampleToColorPreview: () => ["#313441", "#FFFFFF", "#14B2E2", "#464E56", "#94A1AD", "#E2E7EC"],
        };
        return render(<StylingEditorDialog {...defaultProps} {...customProps} />);
    };

    it("should render content", () => {
        renderEditor();

        expect(screen.getByDisplayValue("Theme red")).toBeInTheDocument();
        expect(screen.getByDisplayValue(/palette/).innerHTML).toContain(referenceTheme("red"));
        expect(screen.getAllByLabelText("Styling example action")).toHaveLength(2);
    });

    it("should insert examples into fields", () => {
        renderEditor();
        const examples = screen.getAllByLabelText("Styling example action");

        fireEvent.click(examples.at(0)!);
        expect(screen.getByDisplayValue("Theme green")).toBeInTheDocument();
        expect(screen.getByDisplayValue(/palette/).innerHTML).toContain(referenceTheme("green"));

        fireEvent.click(examples.at(1)!);
        expect(screen.getByDisplayValue("Theme blue")).toBeInTheDocument();
        expect(screen.getByDisplayValue(/palette/).innerHTML).toContain(referenceTheme("blue"));
    });

    it("should not render examples if not provided", () => {
        renderEditor({ examples: undefined });

        expect(screen.queryByLabelText("Styling example action")).not.toBeInTheDocument();
    });

    it("should render empty fields if stylingItem not provided", () => {
        renderEditor({ stylingItem: undefined });

        expect(screen.getByLabelText("Styling item name")).toHaveTextContent("");
        expect(screen.getByLabelText("Styling item definition")).toHaveTextContent("");
    });

    it("should disable save if no changes are provided (ignore white-spacing)", () => {
        renderEditor();
        const saveButton = screen.getByText("Save").closest("button");

        expect(saveButton).toHaveClass("disabled");

        fireEvent.change(screen.getByLabelText("Styling item definition"), {
            target: { value: JSON.stringify(theme("red").content) },
        });

        expect(saveButton).toHaveClass("disabled");
    });

    it("should disable save if no Name or Definition is provided", () => {
        renderEditor({ stylingItem: undefined });
        const textarea = screen.getByLabelText("Styling item definition");
        const saveButton = screen.getByText("Save").closest("button");

        fireEvent.change(textarea, {
            target: { value: "{}" },
        });
        expect(saveButton).toHaveClass("disabled");

        fireEvent.change(screen.getByLabelText("Styling item name"), {
            target: { value: "name" },
        });
        expect(saveButton).not.toHaveClass("disabled");

        fireEvent.change(textarea, {
            target: { value: "" },
        });
        expect(saveButton).toHaveClass("disabled");
    });

    it("should disable save if Definition is invalid JSON", () => {
        renderEditor();
        const textarea = screen.getByLabelText("Styling item definition");
        const saveButton = screen.getByText("Save").closest("button");

        fireEvent.change(textarea, {
            target: { value: "invalid {}" },
        });
        expect(saveButton).toHaveClass("disabled");

        fireEvent.change(textarea, {
            target: { value: "{}" },
        });
        expect(saveButton).not.toHaveClass("disabled");
    });

    it("should enable save after click Post Example", () => {
        renderEditor({ stylingItem: undefined });
        const saveButton = screen.getByText("Save").closest("button");

        expect(saveButton).toHaveClass("disabled");
        fireEvent.click(screen.getAllByLabelText("Styling example action").at(0)!);
        expect(saveButton).not.toHaveClass("disabled");
    });

    it("should render progress indicator if flag provided", () => {
        renderEditor({ showProgressIndicator: true });

        expect(document.querySelector(".s-gd-styling-editor-spinner")).toBeInTheDocument();
    });

    it("should disable Submit button if flag provided", () => {
        renderEditor({ disableSubmit: true });

        expect(screen.getByText("Save").closest("button")).toHaveClass("disabled");
    });
});
