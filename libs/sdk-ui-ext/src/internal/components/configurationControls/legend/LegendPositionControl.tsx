// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { legendPositionDropdownItems } from "../../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

export interface ILegendPositionControl {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export const LegendPositionControl = memo(function LegendPositionControl(props: ILegendPositionControl) {
    const intl = useIntl();
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(legendPositionDropdownItems, intl);
    };

    return (
        <DropdownControl
            value={props.value}
            valuePath="legend.position"
            labelText={messages["position"].id}
            disabled={props.disabled}
            properties={props.properties}
            pushData={props.pushData}
            items={generateDropdownItems()}
            showDisabledMessage={props.showDisabledMessage}
        />
    );
});
