// (C) 2025 GoodData Corporation

import { WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSubsection from "./ConfigSubsection.js";
import DropdownControl from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { grandTotalsPositionDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IGrandTotalsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
}

function GrandTotalsControl({
    pushData,
    properties,
    intl,
    isDisabled,
    showDisabledMessage = false,
}: IGrandTotalsControlProps & WrappedComponentProps) {
    const grandTotalsPosition = properties?.controls?.["grandTotalsPosition"] ?? "pinnedBottom";

    return (
        <ConfigSubsection title={messages["grandTotalsTitle"].id}>
            <DropdownControl
                value={grandTotalsPosition}
                valuePath="grandTotalsPosition"
                labelText={messages["grandTotalsPositionLabel"].id}
                disabled={isDisabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(grandTotalsPositionDropdownItems, intl)}
                showDisabledMessage={showDisabledMessage}
            />
        </ConfigSubsection>
    );
}

export default injectIntl(GrandTotalsControl);
