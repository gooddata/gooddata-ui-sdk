// (C) 2007-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ISeparators } from "@gooddata/sdk-ui";
import {
    IFormatPreset,
    IFormatTemplate,
    IToggleButtonProps,
    MeasureNumberFormat,
} from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const wrapperStyle = { width: 400, height: 800, padding: "1em 1em" };

const documentationLink =
    "https://help.gooddata.com/doc/growth/en/dashboards-and-insights/analytical-designer/work-with-metrics/format-numbers/";

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

function ToggleButton({ toggleDropdown, text }: IToggleButtonProps) {
    return (
        <button
            type="button"
            className="s-measure-number-format-button gd-button gd-button-secondary gd-button-small"
            onClick={toggleDropdown}
        >
            {text}
        </button>
    );
}

function MeasureNumberFormatTest() {
    return (
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
}

export default {
    title: "12 UI Kit/MeasureNumberFormat",
};

export function FullFeatured() {
    return <MeasureNumberFormatTest />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<MeasureNumberFormatTest />);
Themed.parameters = { kind: "themed", screenshot: true } satisfies IStoryParameters;

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
