// (C) 2019-2025 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { ConfigSubsection } from "./ConfigSubsection.js";
import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { pushpinSizeDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IPushpinSizeControl {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

function getPushpinProperty(props: IPushpinSizeControl) {
    const { minSize = "default", maxSize = "default" } = props.properties?.controls?.["points"] ?? {};
    return {
        minSize,
        maxSize,
    };
}

export function PushpinSizeControl(props: IPushpinSizeControl): ReactElement {
    const intl = useIntl();
    const { minSize, maxSize } = getPushpinProperty(props);
    const { disabled, properties, pushData } = props;
    const items = getTranslatedDropdownItems(pushpinSizeDropdownItems, intl);
    return (
        <ConfigSubsection title={messages["pointsSizeTitle"].id}>
            <DropdownControl
                value={minSize}
                valuePath="points.minSize"
                labelText={messages["pointsSizeMinTitle"].id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
            <DropdownControl
                value={maxSize}
                valuePath="points.maxSize"
                labelText={messages["pointsSizeMaxTitle"].id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
        </ConfigSubsection>
    );
}
