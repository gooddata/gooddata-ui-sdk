// (C) 2023-2025 GoodData Corporation
import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import { PushDataCallback } from "@gooddata/sdk-ui";
import { CalculationType } from "@gooddata/sdk-ui-charts";

import CalculationListItem from "./CalculationListItem.js";
import { comparisonMessages } from "../../../../../locales.js";
import { calculationDropdownItems } from "../../../../constants/dropdowns.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import DropdownControl from "../../DropdownControl.js";
import { COMPARISON_CALCULATION_TYPE_VALUE_PATH } from "../ComparisonValuePath.js";

interface ICalculationControlProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    defaultCalculationType: CalculationType;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const CALCULATION_DROPDOWN_WIDTH = 194;

const DISABLED_MESSAGE_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 0, y: 7 } }];

function CalculationControl({
    disabled,
    defaultCalculationType,
    properties,
    showDisabledMessage,
    pushData,
}: ICalculationControlProps) {
    const { formatMessage } = useIntl();
    const calculationType: CalculationType =
        properties.controls?.comparison?.calculationType || defaultCalculationType;

    const items = useMemo(
        () =>
            calculationDropdownItems.map((item) => ({
                ...item,
                title: formatMessage({ id: item.title }),
            })),
        [formatMessage],
    );

    return (
        <div className="calculation-control s-calculation-control">
            <DropdownControl
                value={calculationType}
                valuePath={COMPARISON_CALCULATION_TYPE_VALUE_PATH}
                labelText={comparisonMessages["calculationTypeTitle"].id}
                disabled={disabled}
                showDisabledMessage={showDisabledMessage}
                disabledMessageAlignPoints={DISABLED_MESSAGE_ALIGN_POINTS}
                width={CALCULATION_DROPDOWN_WIDTH}
                items={items}
                customListItem={CalculationListItem}
                properties={properties}
                pushData={pushData}
            />
        </div>
    );
}

export default CalculationControl;
