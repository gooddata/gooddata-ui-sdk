// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import { useIntl } from "react-intl";

import { IGeoConfigViewport } from "@gooddata/sdk-ui-geo";

import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { pushpinViewportDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IPushpinViewportControl {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

function getPushpinProperty(props: IPushpinViewportControl): IGeoConfigViewport {
    return props.properties?.controls?.["viewport"] ?? { area: "auto" };
}

export function PushpinViewportControl(props: IPushpinViewportControl): ReactElement {
    const intl = useIntl();
    const { area } = getPushpinProperty(props);
    const { disabled, properties, pushData } = props;
    return (
        <div className="s-pushpin-viewport-control">
            <DropdownControl
                value={area}
                valuePath="viewport.area"
                labelText={messages["viewportAreaTitle"].id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(pushpinViewportDropdownItems, intl)}
            />
        </div>
    );
}
