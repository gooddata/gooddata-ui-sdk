// (C) 2020-2025 GoodData Corporation
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cx from "classnames";
import { ISeparators, withIntl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";
import "vitest-dom/extend-expect";
import { EditorView } from "@codemirror/view";
import { MeasureNumberFormat, IMeasureNumberFormatOwnProps } from "../MeasureNumberFormat.js";

import { IFormatTemplate, IToggleButtonProps } from "../typings.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

// CodeMirror window method requirements
(window as any).document.body.createTextRange = vi.fn(() => {
    return {
        setStart: vi.fn(),
        setEnd: vi.fn(),
        getBoundingClientRect: vi.fn(),
        getClientRects: vi.fn(() => {
            return { length: null };
        }),
    };
});

const getButtonComponent =
    (): React.FC<IToggleButtonProps> =>
    // eslint-disable-next-line react/display-name
    ({ isOpened, text, toggleDropdown }) => {
        return (
            <div
                className={cx("toggle-button", {
                    opened: isOpened,
                    closed: !isOpened,
                })}
                onClick={toggleDropdown}
            >
                {text}
            </div>
        );
    };

const presets = [
    {
        name: "Currency",
        localIdentifier: "currency",
        format: "€ #,##0.0",
        previewNumber: 1000.12,
    },
];
const separators: ISeparators = {
    decimal: ",",
    thousand: " ",
};
const defaultProps: IMeasureNumberFormatOwnProps = {
    toggleButton: getButtonComponent(),
    presets,
    separators,
    selectedFormat: null,
    setFormat: noop,
};

const renderComponent = (props?: Partial<IMeasureNumberFormatOwnProps>) => {
    const Wrapped = withIntl(MeasureNumberFormat);
    return render(<Wrapped {...defaultProps} {...props} />);
};

describe("Measure number format", () => {
    const getCodeMirrorInstance = (): EditorView => {
        const editorElement = document.querySelector(".cm-editor");
        if (!editorElement) {
            throw new Error("Editor element not found");
        }
        return EditorView.findFromDOM(editorElement as HTMLElement)!;
    };

    const setCustomFormatValue = (value: string) => {
        act(() => {
            const codeMirrorEditor = getCodeMirrorInstance();
            codeMirrorEditor.dispatch({
                changes: { from: 0, to: codeMirrorEditor.state.doc.length, insert: value },
            });
        });
    };

    const togglePresetsDropdown = async () => {
        await userEvent.click(screen.getByText("Format: Custom"));
    };

    const selectPreset = async (value: string) => {
        await userEvent.click(screen.getByText(value));
    };

    const expectOpenPresets = () => {
        expect(screen.getByText("Currency")).toBeInTheDocument();
    };

    const expectClosePresets = () => {
        expect(screen.queryByText("Currency")).not.toBeInTheDocument();
    };

    const clickOnCancel = async () => {
        await userEvent.click(screen.getByText("Cancel"));
    };

    const clickOnApply = async () => {
        await userEvent.click(screen.getByText("Apply"));
    };

    it("should render given button component", () => {
        renderComponent();
        expect(screen.getByText("Format: Custom")).toBeInTheDocument();
    });

    it("should toggle presets dropdown on toggle button click", async () => {
        renderComponent();

        await togglePresetsDropdown();
        expectOpenPresets();

        await togglePresetsDropdown();
        expectClosePresets();
    });

    it("should call 'setFormat' callback with format when preset is selected", async () => {
        const setFormat = vi.fn();
        renderComponent({ setFormat });

        await togglePresetsDropdown();
        await selectPreset("Currency");

        expect(screen.getByText("Format: Currency")).toBeInTheDocument();

        await waitFor(() => {
            expect(setFormat).toBeCalledWith(expect.stringContaining("€ #,##0.0"));
        });
    });

    describe("custom format", () => {
        it("should close the presets dropdown and open the dialog when custom preset is selected", async () => {
            const setFormat = vi.fn();
            renderComponent({ setFormat });

            await togglePresetsDropdown();
            await selectPreset("Custom");

            expect(screen.getByText("Custom format")).toBeInTheDocument();
        });

        it("should close the dialog when cancel is clicked on", async () => {
            renderComponent();

            await togglePresetsDropdown();
            await selectPreset("Custom");
            await clickOnCancel();

            expect(screen.queryByText("Custom format")).not.toBeInTheDocument();
        });

        it("apply button should be enabled once custom format is modified", async () => {
            renderComponent();

            await togglePresetsDropdown();
            await selectPreset("Custom");

            expect(screen.getByText("Custom format")).toBeInTheDocument();

            setCustomFormatValue("test");

            expect(screen.getByText("Apply").closest("button")).not.toHaveClass("disabled");
        });

        it("should call 'setFormat' callback with custom format when format is set and apply button clicked", async () => {
            const setFormat = vi.fn();
            renderComponent({ setFormat });

            await togglePresetsDropdown();
            await selectPreset("Custom");

            setCustomFormatValue("test");

            await clickOnApply();
            await waitFor(() => {
                expect(setFormat).toBeCalledWith(expect.stringContaining("test"));
            });
        });
        it("should display formatted number", async () => {
            renderComponent();

            await togglePresetsDropdown();
            await selectPreset("Custom");
            setCustomFormatValue("#.##");

            expect(screen.getByText("-1234,57")).toBeInTheDocument();
        });

        it("should render documentation link with given url", async () => {
            const documentationLink = "https://www.gooddata.com";
            renderComponent({ documentationLink });

            await togglePresetsDropdown();
            await selectPreset("Custom");

            expect(screen.getByLabelText("custom-format-documentation-link")).toHaveAttribute(
                "href",
                documentationLink,
            );
        });

        describe("custom format templates", () => {
            const openTemplatesDrodown = async () => {
                await userEvent.click(screen.getByText("Templates"));
            };

            const templates: IFormatTemplate[] = [
                {
                    name: "Percentage",
                    localIdentifier: "percentage",
                    format: "#,##0.0%",
                },
                {
                    name: "Currency",
                    localIdentifier: "currency",
                    format: "€ #,##0.0",
                },
            ];

            it("should not render templates button if no templates were provided", async () => {
                renderComponent();
                expect(screen.queryByText("Templates")).not.toBeInTheDocument();
            });

            it("should open templates dropdown containing given templates upon toggle button click", async () => {
                renderComponent({ templates });
                await togglePresetsDropdown();
                await selectPreset("Custom");
                await openTemplatesDrodown();

                expect(screen.getByText("Currency")).toBeInTheDocument();
                expect(screen.getByText("Percentage")).toBeInTheDocument();
            });
        });
    });
});
