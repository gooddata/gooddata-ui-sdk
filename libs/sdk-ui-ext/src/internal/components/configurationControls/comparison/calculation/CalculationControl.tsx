// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { CalculationType } from "@gooddata/sdk-ui-charts";
import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../../locales.js";
import { calculationDropdownItems } from "../../../../constants/dropdowns.js";
import DropdownControl from "../../DropdownControl.js";
import CalculationListItem from "./CalculationListItem.js";
import { COMPARISON_CALCULATION_TYPE_VALUE_PATH } from "../ComparisonValuePath.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";

interface ICalculationControlProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    defaultCalculationType: CalculationType;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const CALCULATION_DROPDOWN_WIDTH = 194;

const DISABLED_MESSAGE_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 0, y: 7 } }];

const CalculationControl: React.FC<ICalculationControlProps> = ({
    disabled,
    defaultCalculationType,
    properties,
    showDisabledMessage,
    pushData,
}) => {
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
                labelText={comparisonMessages.calculationTypeTitle.id}
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
};

export default CalculationControl;
