// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import DropdownControl from "../DropdownControl.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { xAxisPositionDropdownItems, yAxisPositionDropdownItems } from "../../../constants/dropdowns.js";
import { IConfigItemSubsection } from "../../../interfaces/ConfigurationPanel.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

class NamePositionControl extends React.PureComponent<IConfigItemSubsection & WrappedComponentProps> {
    public render() {
        const { axisVisible, axisNameVisible, namePosition } = this.getControlProperties();
        const { axis, properties, pushData, disabled, configPanelDisabled, intl } = this.props;

        const isDisabled = disabled || !axisVisible || !axisNameVisible;
        const items = getTranslatedDropdownItems(
            this.isXAxis() ? xAxisPositionDropdownItems : yAxisPositionDropdownItems,
            intl,
        );
        return (
            <DropdownControl
                value={namePosition}
                valuePath={`${axis}.name.position`}
                labelText={messages.axisNamePosition.id}
                disabled={isDisabled}
                showDisabledMessage={!configPanelDisabled && isDisabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
        );
    }

    private isXAxis(): boolean {
        const { axis } = this.props;
        return axis === "xaxis" || axis === "secondary_xaxis";
    }

    private getControlProperties(): IVisualizationProperties {
        const axisProperties = this.props.properties?.controls?.[this.props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisNameVisible = axisProperties?.name?.visible ?? true;
        const namePosition = axisProperties?.name?.position ?? "auto";

        return {
            axisVisible,
            axisNameVisible,
            namePosition,
        };
    }
}

export default injectIntl(NamePositionControl);
