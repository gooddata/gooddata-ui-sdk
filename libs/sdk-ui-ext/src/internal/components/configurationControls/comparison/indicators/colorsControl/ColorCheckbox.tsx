// (C) 2023-2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { PushDataCallback } from "@gooddata/sdk-ui";
import { Checkbox } from "@gooddata/sdk-ui-kit";

import { comparisonMessages } from "../../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import DisabledBubbleMessage from "../../../../DisabledBubbleMessage.js";
import { COMPARISON_COLOR_CONFIG_DISABLED } from "../../ComparisonValuePath.js";

interface IColorItemProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

function ColorCheckbox({ disabled, showDisabledMessage, properties, pushData }: IColorItemProps) {
    const { formatMessage } = useIntl();

    const checked = !properties?.controls?.comparison?.colorConfig?.disabled;
    const label = formatMessage(comparisonMessages["colorsConfigTitle"]);

    const handleChange = (value: boolean) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties.controls, COMPARISON_COLOR_CONFIG_DISABLED, !value);

        pushData({ properties: clonedProperties });
    };

    return (
        <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
            <Checkbox text={label} value={checked} disabled={disabled} onChange={handleChange} />
        </DisabledBubbleMessage>
    );
}

export default ColorCheckbox;
