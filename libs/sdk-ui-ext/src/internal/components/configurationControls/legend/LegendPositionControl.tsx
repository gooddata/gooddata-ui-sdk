// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { legendPositionDropdownItems } from "../../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import DropdownControl from "../DropdownControl.js";

export interface ILegendPositionControl {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const LegendPositionControl = memo(function LegendPositionControl(
    props: ILegendPositionControl & WrappedComponentProps,
) {
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(legendPositionDropdownItems, props.intl);
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

export default injectIntl(LegendPositionControl);
