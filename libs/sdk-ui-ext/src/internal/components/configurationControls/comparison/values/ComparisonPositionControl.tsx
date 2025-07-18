// (C) 2023-2025 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { PushDataCallback } from "@gooddata/sdk-ui";
import { ComparisonPositionValues } from "@gooddata/sdk-ui-charts";

import DropdownControl from "../../DropdownControl.js";
import { comparisonMessages } from "../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { COMPARISON_POSITION_VALUE_PATH } from "../ComparisonValuePath.js";
import { comparisonPositionDropdownItems } from "../../../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../../../utils/translations.js";

interface IPositionControlProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

export default function ComparisonPositionControl({
    disabled,
    showDisabledMessage,
    properties,
    pushData,
}: IPositionControlProps) {
    const intl = useIntl();
    const position = properties?.controls?.comparison?.position || ComparisonPositionValues.AUTO;

    const items = useMemo(() => getTranslatedDropdownItems(comparisonPositionDropdownItems, intl), [intl]);

    return (
        <div className="comparion-postion-control s-comparison-position-control">
            <DropdownControl
                value={position}
                valuePath={COMPARISON_POSITION_VALUE_PATH}
                labelText={comparisonMessages.positionTitle.id}
                disabled={disabled}
                showDisabledMessage={showDisabledMessage}
                items={items}
                properties={properties}
                pushData={pushData}
            />
        </div>
    );
}
