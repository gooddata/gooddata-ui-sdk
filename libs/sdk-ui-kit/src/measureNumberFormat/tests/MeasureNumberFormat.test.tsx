// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import cx from "classnames";
import { ISeparators, withIntl } from "@gooddata/sdk-ui";

import { MeasureNumberFormat, IMeasureNumberFormatOwnProps } from "../MeasureNumberFormat";

import { IFormatTemplate, IToggleButtonProps } from "../typings";

// CodeMirror window method requirements
(window as any).document.body.createTextRange = jest.fn(() => {
    return {
        setStart: jest.fn(),
        setEnd: jest.fn(),
        getBoundingClientRect: jest.fn(),
        getClientRects: jest.fn(() => {
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
    const getCodeMirrorInstance = (): CodeMirror.Editor => {
        return (document.querySelector(".CodeMirror") as any).CodeMirror;
    };

    const setCustomFormatValue = (value: string) => {
        const codeMirrorEditor = getCodeMirrorInstance();
        codeMirrorEditor.setValue(value);
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
        const setFormat = jest.fn();
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
            const setFormat = jest.fn();
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
            const setFormat = jest.fn();
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
