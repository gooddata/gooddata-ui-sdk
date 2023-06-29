// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

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

function getPushpinProperty(props: IPushpinSizeControl & WrappedComponentProps) {
    const { minSize = "default", maxSize = "default" } = props.properties?.controls?.points ?? {};
    return {
        minSize,
        maxSize,
    };
}

function PushpinSizeControl(props: IPushpinSizeControl & WrappedComponentProps): React.ReactElement {
    const { minSize, maxSize } = getPushpinProperty(props);
    const { disabled, properties, pushData, intl } = props;
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

export default injectIntl(PushpinSizeControl);
