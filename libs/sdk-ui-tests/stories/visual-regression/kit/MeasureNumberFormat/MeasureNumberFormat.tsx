// (C) 2007-2019 GoodData Corporation
import {
    IFormatPreset,
    IFormatTemplate,
    IToggleButtonProps,
    MeasureNumberFormat,
} from "@gooddata/sdk-ui-kit";
import React from "react";
import { storiesOf } from "../../../_infra/storyRepository.js";
import { action } from "@storybook/addon-actions";
import { UiKit } from "../../../_infra/storyGroups.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import { ISeparators } from "@gooddata/sdk-ui";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const documentationLink =
    "https://help.gooddata.com/doc/en/reporting-and-dashboards/reports/working-with-reports/formatting-numbers-in-reports";

const presets: IFormatPreset[] = [
    {
        name: "Whole number",
        localIdentifier: "whole-number",
        format: "#,##0",
        previewNumber: 1000.12,
    },
    {
        name: "Decimal number",
        localIdentifier: "decimal-number",
        format: "[=null]--;\n" + "[<.3][red]#,##0.00;\n" + "[>.8][green]#,##0.00;\n" + "#,##0.00",
        previewNumber: 1000.12,
    },
    {
        name: "Percentage",
        localIdentifier: "percentage",
        format: "#,##0.0%",
        previewNumber: 1000.12,
    },
    {
        name: "Currency",
        localIdentifier: "currency",
        format: "€ #,##0.0",
        previewNumber: 1000.12,
    },
];

const templates: IFormatTemplate[] = [
    {
        name: "Whole number",
        localIdentifier: "whole-number",
        format: "#,##0",
    },
    {
        name: "Decimal number",
        localIdentifier: "decimal-number",
        format: "[=null]--;\n" + "[<.3][red]#,##0.00;\n" + "[>.8][green]#,##0.00;\n" + "#,##0.00",
    },
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

const separators: ISeparators = {
    thousand: " ",
    decimal: ".",
};

const ToggleButton: React.FC<IToggleButtonProps> = ({ toggleDropdown, text }) => (
    <button
        type="button"
        className="s-measure-number-format-button gd-button gd-button-secondary gd-button-small"
        onClick={toggleDropdown}
    >
        {text}
    </button>
);

const MeasureNumberFormatTest = () => (
    <div style={wrapperStyle} className="screenshot-target">
        <MeasureNumberFormat
            toggleButton={ToggleButton}
            presets={presets}
            separators={separators}
            templates={templates}
            selectedFormat={null}
            setFormat={action(`selected format`)}
            documentationLink={documentationLink}
        />
    </div>
);

storiesOf(`${UiKit}/MeasureNumberFormat`)
    .add("full-featured", () => <MeasureNumberFormatTest />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<MeasureNumberFormatTest />), { screenshot: true });
/*
        {
            closed: {},
            opened: {
                clickSelector: ".s-measure-number-format-button",
                postInteractionWait: 2000 },
            "custom-editor": {
                clickSelectors: [".s-measure-number-format-button", ".s-format-preset-customFormat"],
                postInteractionWait: 2000,
            },
            "custom-editor-extended-preview": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-custom-format-dialog-extended-preview-button",
                ],
                postInteractionWait: 2000,
            },
            "custom-editor-templates": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-measure-format-templates-toggle-button",
                ],
                postInteractionWait: 2000,
            },
            "custom-editor-templates-selected": {
                clickSelectors: [
                    ".s-measure-number-format-button",
                    ".s-format-preset-customFormat",
                    ".s-measure-format-templates-toggle-button",
                    ".s-measure-format-template-decimal_number",
                ],
                postInteractionWait: 2000,
            },
        },
    );*/
