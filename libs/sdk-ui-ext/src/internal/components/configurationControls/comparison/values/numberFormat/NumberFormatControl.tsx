// (C) 2023-2025 GoodData Corporation

import { useMemo } from "react";

import { cloneDeep, set } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import { ISeparators, PushDataCallback } from "@gooddata/sdk-ui";
import { MeasureNumberFormat } from "@gooddata/sdk-ui-kit";

import { NumberFormatToggleButton } from "./NumberFormatToggleButton.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { getPresets, getTemplates } from "../../../../../utils/comparisonHelper.js";
import { DisabledBubbleMessage } from "../../../../DisabledBubbleMessage.js";

interface INumberFormatControlProps {
    disabled: boolean;
    valuePath: string;
    labelText: string;
    format: string;
    showDisabledMessage?: boolean;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

export function NumberFormatControl({
    disabled,
    valuePath,
    labelText,
    format,
    showDisabledMessage,
    separators,
    properties,
    pushData,
}: INumberFormatControlProps) {
    const intl = useIntl();

    const selectFormat = (format: string) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties.controls, valuePath, format);

        pushData({ properties: clonedProperties });
    };

    const presets = useMemo(() => getPresets(intl), [intl]);
    const templates = useMemo(() => getTemplates(intl), [intl]);

    return (
        <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
            <div className="adi-properties-dropdown-container measure-number-format-control">
                <span className="input-label-text">
                    <FormattedMessage id={labelText} />
                </span>
                <label className="adi-bucket-inputfield gd-input gd-input-small measure-number-format-control-dropdown">
                    <MeasureNumberFormat
                        disabled={disabled}
                        toggleButton={NumberFormatToggleButton}
                        presets={presets}
                        templates={templates}
                        separators={separators}
                        selectedFormat={format}
                        setFormat={selectFormat}
                        locale={intl.locale}
                        key={format}
                    />
                </label>
            </div>
        </DisabledBubbleMessage>
    );
}
