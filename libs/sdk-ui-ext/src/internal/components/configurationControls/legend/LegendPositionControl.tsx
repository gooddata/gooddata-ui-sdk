// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";
import { useIntl } from "react-intl";

import DropdownControl from "../DropdownControl.js";
import { legendPositionDropdownItems } from "../../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

export interface ILegendPositionControl {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const LegendPositionControl = memo(function LegendPositionControl({
    value,
    disabled,
    properties,
    pushData,
    showDisabledMessage,
}: ILegendPositionControl) {
    const intl = useIntl();

    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(legendPositionDropdownItems, intl);
    };

    return (
        <DropdownControl
            value={value}
            valuePath="legend.position"
            labelText={messages.position.id}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            items={generateDropdownItems()}
            showDisabledMessage={showDisabledMessage}
        />
    );
});

export default LegendPositionControl;
