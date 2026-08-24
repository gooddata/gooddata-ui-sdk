// (C) 2022-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ITheme } from "@gooddata/sdk-model";

import {
    type IStylingEditorDialogProps,
    type IStylingPickerItem,
    StylingEditorDialog,
} from "./StylingEditorDialog/StylingEditorDialog.js";

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

    it.each(['"just a string"', "42", "true", "null"])(
        "should not enable save for the bare JSON value %s",
        (definition) => {
            // A theme is an object and a palette an array; JSON.parse accepts these, but they are not
            // a styling definition and submitting one would persist it as the whole content.
            renderEditor();
            const saveButton = screen.getByText("Save").closest("button");

            fireEvent.change(screen.getByLabelText("Styling item definition"), {
                target: { value: definition },
            });

            expect(saveButton).toHaveClass("disabled");
        },
    );

    it("should enable save for a palette, which is a JSON array", () => {
        renderEditor({ stylingItem: undefined });
        fireEvent.change(screen.getByLabelText("Styling item name"), { target: { value: "name" } });
        fireEvent.change(screen.getByLabelText("Styling item definition"), {
            target: { value: '[{ "guid": "a", "fill": { "r": 1, "g": 2, "b": 3 } }]' },
        });

        expect(screen.getByText("Save").closest("button")).not.toHaveClass("disabled");
    });

    it("should render progress indicator if flag provided", () => {
        renderEditor({ showProgressIndicator: true });

        expect(document.querySelector(".s-gd-styling-editor-spinner")).toBeInTheDocument();
    });

    it("should disable Submit button if flag provided", () => {
        renderEditor({ disableSubmit: true });

        expect(screen.getByText("Save").closest("button")).toHaveClass("disabled");
    });

    it("should disable save when validateDefinition rejects the content and re-enable when valid", () => {
        const validateDefinition = (content: ITheme) =>
            content?.palette?.primary?.base === "bad" ? "Invalid color value." : undefined;
        renderEditor({ validateDefinition });
        const textarea = screen.getByLabelText("Styling item definition");
        const saveButton = screen.getByText("Save").closest("button");

        fireEvent.change(textarea, { target: { value: referenceTheme("bad") } });
        expect(saveButton).toHaveClass("disabled");

        fireEvent.change(textarea, { target: { value: referenceTheme("#001F5A") } });
        expect(saveButton).not.toHaveClass("disabled");
    });

    it("should not crash and should not block saving when validateDefinition throws", () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
            const validateDefinition = () => {
                throw new Error("boom in validator");
            };
            renderEditor({ validateDefinition });
            const textarea = screen.getByLabelText("Styling item definition");
            const saveButton = screen.getByText("Save").closest("button");

            fireEvent.change(textarea, { target: { value: referenceTheme("#001F5A") } });

            // a buggy validator degrades gracefully: the dialog still renders and the user can save
            expect(saveButton).not.toHaveClass("disabled");
            expect(consoleErrorSpy).toHaveBeenCalled();
        } finally {
            // always restore so a failed assertion cannot leak the spy into later tests
            consoleErrorSpy.mockRestore();
        }
    });

    describe("validateDefinitionWarning", () => {
        const WARNING = "Missing required color.";
        const warnOnColor = (color: string) => (content: ITheme) =>
            content?.palette?.primary?.base === color ? WARNING : undefined;

        const warning = () => document.querySelector(".s-styling-editor-warning");

        it("should report without disabling save", () => {
            renderEditor({ validateDefinitionWarning: warnOnColor("#001F5A") });
            const textarea = screen.getByLabelText("Styling item definition");

            fireEvent.change(textarea, { target: { value: referenceTheme("#001F5A") } });

            expect(warning()).toHaveTextContent(WARNING);
            expect(screen.getByText("Save").closest("button")).not.toHaveClass("disabled");

            fireEvent.change(textarea, { target: { value: referenceTheme("#CF4500") } });

            expect(warning()).not.toBeInTheDocument();
        });

        it("should report on the definition the dialog opened with", () => {
            renderEditor({ validateDefinitionWarning: warnOnColor("red") });

            expect(warning()).toHaveTextContent(WARNING);
        });

        it("should report while the name field is still empty", () => {
            // The add flow opens with no name, so the dialog already has a blocking error of its own;
            // pasting a definition there is the main way this warning is ever seen.
            renderEditor({ stylingItem: undefined, validateDefinitionWarning: warnOnColor("#001F5A") });

            fireEvent.change(screen.getByLabelText("Styling item definition"), {
                target: { value: referenceTheme("#001F5A") },
            });

            expect(warning()).toHaveTextContent(WARNING);
        });

        it("should stay hidden while the content is rejected outright", () => {
            renderEditor({
                validateDefinition: () => "Invalid color value.",
                validateDefinitionWarning: warnOnColor("#001F5A"),
            });

            fireEvent.change(screen.getByLabelText("Styling item definition"), {
                target: { value: referenceTheme("#001F5A") },
            });

            expect(warning()).not.toBeInTheDocument();
        });

        it("should not crash and should not block saving when it throws", () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            try {
                renderEditor({
                    validateDefinitionWarning: () => {
                        throw new Error("boom in warning callback");
                    },
                });

                fireEvent.change(screen.getByLabelText("Styling item definition"), {
                    target: { value: referenceTheme("#001F5A") },
                });

                expect(warning()).not.toBeInTheDocument();
                expect(screen.getByText("Save").closest("button")).not.toHaveClass("disabled");
                expect(consoleErrorSpy).toHaveBeenCalled();
            } finally {
                consoleErrorSpy.mockRestore();
            }
        });
    });

    describe("with a custom definition editor", () => {
        // Stands in for a richer editor (e.g. UiConfigEditor) without pulling one in here: what
        // matters is that the dialog's own validation and submit still work through the slot.
        const renderWithSlot = (customProps: Partial<IStylingEditorDialogProps<ITheme>> = {}) =>
            renderEditor({
                renderDefinitionEditor: ({ value, onChange }) => (
                    <textarea
                        aria-label="Custom definition editor"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ),
                ...customProps,
            });

        it("should render the custom editor instead of the default textarea", () => {
            renderWithSlot();

            expect(screen.getByLabelText("Custom definition editor")).toBeInTheDocument();
            expect(screen.queryByLabelText("Styling item definition")).not.toBeInTheDocument();
        });

        it("should seed the custom editor with the definition as JSON text", () => {
            renderWithSlot();

            expect(screen.getByLabelText("Custom definition editor")).toHaveValue(referenceTheme("red"));
        });

        it("should still validate and submit the value coming back from the custom editor", () => {
            const onSubmit = vi.fn();
            renderWithSlot({ onSubmit });
            const editor = screen.getByLabelText("Custom definition editor");
            const saveButton = screen.getByText("Save").closest("button");

            fireEvent.change(editor, { target: { value: "{ not json" } });
            expect(saveButton).toHaveClass("disabled");

            fireEvent.change(editor, { target: { value: referenceTheme("green") } });
            expect(saveButton).not.toHaveClass("disabled");

            fireEvent.click(saveButton!);
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ content: theme("green").content }),
            );
        });

        it("should push an applied example into the custom editor", () => {
            renderWithSlot();

            fireEvent.click(screen.getAllByLabelText("Styling example action").at(0)!);

            expect(screen.getByLabelText("Custom definition editor")).toHaveValue(referenceTheme("green"));
        });
    });
});
