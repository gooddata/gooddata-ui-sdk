// (C) 2020-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import DropdownControl from "./DropdownControl.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { pushpinViewportDropdownItems } from "../../constants/dropdowns.js";
import { messages } from "../../../locales.js";

export interface IPushpinViewportControl {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export default function PushpinViewportControl({
    disabled,
    properties,
    pushData,
}: IPushpinViewportControl): React.ReactElement {
    const area = properties?.controls?.viewport.area ?? "auto";

    const intl = useIntl();

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
