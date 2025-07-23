// (C) 2019-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import ConfigSubsection from "./ConfigSubsection.js";
import DropdownControl from "./DropdownControl.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { pushpinSizeDropdownItems } from "../../constants/dropdowns.js";
import { messages } from "../../../locales.js";

export interface IPushpinSizeControl {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

function getPushpinProperty(properties: IVisualizationProperties) {
    const { minSize = "default", maxSize = "default" } = properties?.controls?.points ?? {};
    return {
        minSize,
        maxSize,
    };
}

export default function PushpinSizeControl({
    disabled,
    properties,
    pushData,
}: IPushpinSizeControl): React.ReactElement {
    const intl = useIntl();

    const { minSize, maxSize } = getPushpinProperty(properties);
    const items = getTranslatedDropdownItems(pushpinSizeDropdownItems, intl);

    return (
        <ConfigSubsection title={messages.pointsSizeTitle.id}>
            <DropdownControl
                value={minSize}
                valuePath="points.minSize"
                labelText={messages.pointsSizeMinTitle.id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
            <DropdownControl
                value={maxSize}
                valuePath="points.maxSize"
                labelText={messages.pointsSizeMaxTitle.id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
        </ConfigSubsection>
    );
}
