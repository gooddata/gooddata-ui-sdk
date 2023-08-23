// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { Button } from "@gooddata/sdk-ui-kit";
import { PushDataCallback } from "@gooddata/sdk-ui";

import { messages } from "../../../../../../locales.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import {
    COMPARISON_COLOR_CONFIG_EQUALS,
    COMPARISON_COLOR_CONFIG_NEGATIVE,
    COMPARISON_COLOR_CONFIG_POSITIVE,
} from "../../ComparisonValuePath.js";
import { isComparisonDefaultColors } from "../../../../../utils/comparisonHelper.js";

interface IColorResetButtonProps {
    disabled: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const ColorResetButton: React.FC<IColorResetButtonProps> = ({ disabled, properties, pushData }) => {
    const { formatMessage } = useIntl();

    const label = formatMessage(messages.resetColors);
    const isDefaultColors = isComparisonDefaultColors(properties?.controls?.comparison?.colorConfig);

    const resetColors = () => {
        const clonedProperties = cloneDeep(properties);

        set(clonedProperties.controls, COMPARISON_COLOR_CONFIG_POSITIVE, undefined);
        set(clonedProperties.controls, COMPARISON_COLOR_CONFIG_NEGATIVE, undefined);
        set(clonedProperties.controls, COMPARISON_COLOR_CONFIG_EQUALS, undefined);

        pushData({ properties: clonedProperties });
    };

    const classNames = cx(["gd-color-reset-colors-section", "s-gd-color-reset-colors-section"], {
        disabled: disabled || isDefaultColors,
    });

    return (
        <div className={classNames}>
            <Button value={label} className="gd-button-link" onClick={resetColors} disabled={disabled} />
        </div>
    );
};

export default ColorResetButton;
