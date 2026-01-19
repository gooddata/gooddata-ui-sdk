// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { sensitivityDropdownItems } from "../../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

export interface IAnomalySensitivityControl {
    disabled: boolean;
    value: "low" | "medium" | "high";
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export const AnomalySensitivityControl = memo(function AnomalySensitivityControl(
    props: IAnomalySensitivityControl,
) {
    const intl = useIntl();
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(sensitivityDropdownItems, intl);
    };

    return (
        <DropdownControl
            value={props.value}
            valuePath="anomalies.sensitivity"
            labelText={messages["anomalySensitivity"].id}
            disabled={props.disabled}
            properties={props.properties}
            pushData={props.pushData}
            items={generateDropdownItems()}
            showDisabledMessage={props.showDisabledMessage}
        />
    );
});
