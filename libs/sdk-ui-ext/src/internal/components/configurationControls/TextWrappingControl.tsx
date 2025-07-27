// (C) 2019-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { ChartCellTextWrapping } from "@gooddata/sdk-ui-charts";
import DropdownControl from "./DropdownControl.js";
import { IPushData } from "@gooddata/sdk-ui";

import { textWrappingDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";

export interface ITextWrappingControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartCellTextWrapping;
}

export function TextWrappingControl({
    pushData,
    properties,
    defaultValue = "clip",
}: ITextWrappingControlProps) {
    const intl = useIntl();
    const rowSizing = properties?.controls?.cellTextWrapping ?? defaultValue;

    return (
        <div className="s-text-wrapping-config">
            <DropdownControl
                value={rowSizing}
                valuePath="cellTextWrapping"
                labelText={messages.textWrapping.id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(textWrappingDropdownItems, intl)}
            />
        </div>
    );
}
