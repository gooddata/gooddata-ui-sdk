// (C) 2019-2020 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { IVisualizationProperties } from "../../interfaces/Visualization";
import ConfigSubsection from "./ConfigSubsection";
import DropdownControl from "./DropdownControl";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { pushpinSizeDropdownItems } from "../../constants/dropdowns";

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
        <ConfigSubsection title="properties.points.size.title">
            <DropdownControl
                value={minSize}
                valuePath="points.minSize"
                labelText="properties.points.size.min.title"
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={items}
            />
            <DropdownControl
                value={maxSize}
                valuePath="points.maxSize"
                labelText="properties.points.size.max.title"
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
