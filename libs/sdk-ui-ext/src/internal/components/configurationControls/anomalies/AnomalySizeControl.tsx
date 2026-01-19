// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { pointSizeDropdownItems } from "../../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

export interface IAnomalySizeControl {
    disabled: boolean;
    value: "small" | "medium" | "big";
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export const AnomalySizeControl = memo(function AnomalySizeControl(props: IAnomalySizeControl) {
    const intl = useIntl();
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(pointSizeDropdownItems, intl);
    };

    return (
        <DropdownControl
            value={props.value}
            valuePath="anomalies.size"
            labelText={messages["anomalyPointSize"].id}
            disabled={props.disabled}
            properties={props.properties}
            pushData={props.pushData}
            items={generateDropdownItems()}
            showDisabledMessage={props.showDisabledMessage}
        />
    );
});
