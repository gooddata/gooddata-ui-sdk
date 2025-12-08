// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { xAxisPositionDropdownItems, yAxisPositionDropdownItems } from "../../../constants/dropdowns.js";
import { IConfigItemSubsection } from "../../../interfaces/ConfigurationPanel.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

export const NamePositionControl = memo(function NamePositionControl(props: IConfigItemSubsection) {
    const intl = useIntl();

    const isXAxis = (): boolean => {
        const { axis } = props;
        return axis === "xaxis" || axis === "secondary_xaxis";
    };

    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = props.properties?.controls?.[props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisNameVisible = axisProperties?.name?.visible ?? true;
        const namePosition = axisProperties?.name?.position ?? "auto";

        return {
            axisVisible,
            axisNameVisible,
            namePosition,
        };
    };

    const { axisVisible, axisNameVisible, namePosition } = getControlProperties();
    const { axis, properties, pushData, disabled, configPanelDisabled } = props;

    const isDisabled = disabled || !axisVisible || !axisNameVisible;
    const items = getTranslatedDropdownItems(
        isXAxis() ? xAxisPositionDropdownItems : yAxisPositionDropdownItems,
        intl,
    );
    return (
        <DropdownControl
            value={namePosition}
            valuePath={`${axis}.name.position`}
            labelText={messages["axisNamePosition"].id}
            disabled={isDisabled}
            showDisabledMessage={!configPanelDisabled && isDisabled}
            properties={properties}
            pushData={pushData}
            items={items}
        />
    );
});
