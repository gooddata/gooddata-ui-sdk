// (C) 2020-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import DropdownControl from "./DropdownControl";
import { IVisualizationProperties } from "../../interfaces/Visualization";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { pushpinViewportDropdownItems } from "../../constants/dropdowns";
import { IGeoConfigViewport } from "@gooddata/sdk-ui-geo";
import { messages } from "../../../locales";

export interface IPushpinViewportControl {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

function getPushpinProperty(props: IPushpinViewportControl & WrappedComponentProps): IGeoConfigViewport {
    return props.properties?.controls?.viewport ?? { area: "auto" };
}

function PushpinViewportControl(props: IPushpinViewportControl & WrappedComponentProps): React.ReactElement {
    const { area } = getPushpinProperty(props);
    const { disabled, properties, pushData, intl } = props;
    return (
        <div className="s-pushpin-viewport-control">
            <DropdownControl
                value={area}
                valuePath="viewport.area"
                labelText={messages.viewportAreaTitle.id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(pushpinViewportDropdownItems, intl)}
            />
        </div>
    );
}

export default injectIntl(PushpinViewportControl);
