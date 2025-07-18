// (C) 2023-2025 GoodData Corporation

import { useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { Checkbox } from "@gooddata/sdk-ui-kit";
import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../../../locales.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { COMPARISON_COLOR_CONFIG_DISABLED } from "../../ComparisonValuePath.js";
import DisabledBubbleMessage from "../../../../DisabledBubbleMessage.js";

interface IColorItemProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

export default function ColorCheckbox({
    disabled,
    showDisabledMessage,
    properties,
    pushData,
}: IColorItemProps) {
    const { formatMessage } = useIntl();

    const checked = !properties?.controls?.comparison?.colorConfig?.disabled;
    const label = formatMessage(comparisonMessages.colorsConfigTitle);

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
