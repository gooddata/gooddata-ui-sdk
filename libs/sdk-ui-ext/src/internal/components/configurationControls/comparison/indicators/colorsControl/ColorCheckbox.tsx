// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { Checkbox } from "@gooddata/sdk-ui-kit";
import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../../../locales.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { COMPARISON_COLOR_CONFIG_DISABLED } from "../../ComparisonValuePath.js";

interface IColorItemProps {
    disabled: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const ColorCheckbox: React.FC<IColorItemProps> = ({ disabled, properties, pushData }) => {
    const { formatMessage } = useIntl();

    const checked = !properties?.controls?.comparison?.colorConfig?.disabled;
    const label = formatMessage(comparisonMessages.colorsConfigTitle);

    const handleChange = (value: boolean) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties.controls, COMPARISON_COLOR_CONFIG_DISABLED, !value);

        pushData({ properties: clonedProperties });
    };

    return <Checkbox text={label} value={checked} disabled={disabled} onChange={handleChange} />;
};

export default ColorCheckbox;
