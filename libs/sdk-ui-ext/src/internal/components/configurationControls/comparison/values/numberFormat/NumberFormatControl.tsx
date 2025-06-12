// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { MeasureNumberFormat } from "@gooddata/sdk-ui-kit";
import { ISeparators, PushDataCallback } from "@gooddata/sdk-ui";

import NumberFormatToggleButton from "./NumberFormatToggleButton.js";
import DisabledBubbleMessage from "../../../../DisabledBubbleMessage.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { getPresets, getTemplates } from "../../../../../utils/comparisonHelper.js";

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

const NumberFormatControl: React.FC<INumberFormatControlProps> = ({
    disabled,
    valuePath,
    labelText,
    format,
    showDisabledMessage,
    separators,
    properties,
    pushData,
}) => {
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
};

export default NumberFormatControl;
