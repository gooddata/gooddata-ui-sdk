// (C) 2023-2025 GoodData Corporation

import { MessageDescriptor, useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";

import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { PushDataCallback } from "@gooddata/sdk-ui";
import { ComparisonColorType, getComparisonRgbColor } from "@gooddata/sdk-ui-charts";

import ColoredItemContent from "../../../colors/coloredItemsList/ColoredItemContent.js";
import ColorDropdown from "../../../colors/colorDropdown/ColorDropdown.js";
import DisabledBubbleMessage from "../../../../DisabledBubbleMessage.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";

interface IColorItemProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    color: IColor;
    colorType: ComparisonColorType;
    colorPalette: IColorPalette;
    labelDescriptor: MessageDescriptor;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    valuePath: string;
    pushData: PushDataCallback;
}

export default function ColorItem({
    disabled,
    showDisabledMessage,
    color,
    colorType,
    colorPalette,
    labelDescriptor,
    valuePath,
    properties,
    pushData,
}: IColorItemProps) {
    const { formatMessage } = useIntl();

    const label = formatMessage(labelDescriptor);
    const rgbColor = getComparisonRgbColor(color, colorType, colorPalette);

    const handleColorSelected = (color: IColor) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties.controls, valuePath, color);

        pushData({ properties: clonedProperties });
    };

    return (
        <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
            <ColorDropdown
                colorPalette={colorPalette}
                onColorSelected={handleColorSelected}
                selectedColorItem={color}
                showCustomPicker={true}
                disabled={disabled}
            >
                <ColoredItemContent text={label} color={rgbColor} />
            </ColorDropdown>
        </DisabledBubbleMessage>
    );
}
