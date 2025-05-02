// (C) 2023-2025 GoodData Corporation
import React, { useMemo } from "react";
import BaseHeadline from "../headlines/baseHeadline/BaseHeadline.js";
import { getBaseHeadlineData } from "../utils/BaseHeadlineTransformationUtils.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { useFireDrillEvent } from "./useFiredDrillEvent.js";

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {@link BaseHeadline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
const MultiMeasuresTransformation: React.FC<IHeadlineTransformationProps> = ({
    dataView,
    drillableItems,
    config,
    onAfterRender,
    onDrill,
}) => {
    const { handleFiredDrillEvent } = useFireDrillEvent(dataView, onDrill);

    const data = useMemo(() => getBaseHeadlineData(dataView, drillableItems), [dataView, drillableItems]);

    return (
        <BaseHeadline
            data={data}
            config={config}
            onDrill={handleFiredDrillEvent}
            onAfterRender={onAfterRender}
        />
    );
};

export default MultiMeasuresTransformation;
