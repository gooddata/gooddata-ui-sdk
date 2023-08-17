// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { MeasureNumberFormat } from "@gooddata/sdk-ui-kit";
import { ISeparators, PushDataCallback } from "@gooddata/sdk-ui";

import NumberFormatToggleButton from "./NumberFormatToggleButton.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { COMPARISON_FORMAT_VALUE_PATH } from "../../ComparisonValuePath.js";
import { comparisonMessages } from "../../../../../../locales.js";
import { getPresets, getTemplates } from "../../../../../utils/comparisonHelper.js";

interface INumberFormatControlProps {
    disabled: boolean;
    defaultFormat: string;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const NumberFormatControl: React.FC<INumberFormatControlProps> = ({
    disabled,
    defaultFormat,
    separators,
    properties,
    pushData,
}) => {
    const intl = useIntl();

    const format = properties?.controls?.comparison?.format || defaultFormat;

    const selectFormat = (format: string) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties.controls, COMPARISON_FORMAT_VALUE_PATH, format);

        pushData({ properties: clonedProperties });
    };

    const presets = useMemo(() => getPresets(intl), [intl]);
    const templates = useMemo(() => getTemplates(intl), [intl]);

    return (
        <div className="adi-properties-dropdown-container measure-number-format-control">
            <span className="input-label-text">
                <FormattedMessage id={comparisonMessages.formatTitle.id} />
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
    );
};

export default NumberFormatControl;
