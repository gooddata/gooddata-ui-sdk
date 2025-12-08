// (C) 2023-2025 GoodData Corporation

import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { CheckboxControl } from "../../CheckboxControl.js";
import { COMPARISON_IS_ARROW_ENABLED_PATH } from "../ComparisonValuePath.js";

interface IArrowControlProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

export function ArrowControl({ disabled, showDisabledMessage, properties, pushData }: IArrowControlProps) {
    const isArrowEnabled = properties?.controls?.comparison?.isArrowEnabled;

    return (
        <div className="comparison-arrow-control s-comparison-arrow-control">
            <CheckboxControl
                valuePath={COMPARISON_IS_ARROW_ENABLED_PATH}
                labelText={comparisonMessages["arrowControlTitle"].id}
                properties={properties}
                checked={isArrowEnabled}
                disabled={disabled}
                showDisabledMessage={showDisabledMessage}
                pushData={pushData}
            />
        </div>
    );
}
