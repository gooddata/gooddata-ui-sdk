// (C) 2023 GoodData Corporation
import React from "react";

import { PushDataCallback } from "@gooddata/sdk-ui";

import CheckboxControl from "../../CheckboxControl.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { comparisonMessages } from "../../../../../locales.js";
import { COMPARISON_IS_ARROW_ENABLED_PATH } from "../ComparisonValuePath.js";

interface IArrowControlProps {
    disabled: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const ArrowControl: React.FC<IArrowControlProps> = ({ disabled, properties, pushData }) => {
    const isArrowEnabled = properties?.controls?.comparison?.isArrowEnabled;

    return (
        <div className="comparison-arrow-control s-comparison-arrow-control">
            <CheckboxControl
                valuePath={COMPARISON_IS_ARROW_ENABLED_PATH}
                labelText={comparisonMessages.arrowControlTitle.id}
                properties={properties}
                checked={isArrowEnabled}
                disabled={disabled}
                pushData={pushData}
            />
        </div>
    );
};

export default ArrowControl;
