// (C) 2023-2025 GoodData Corporation

import { useMemo } from "react";

import { useFireDrillEvent } from "./useFiredDrillEvent.js";
import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { BaseHeadline } from "../headlines/baseHeadline/BaseHeadline.js";
import { getBaseHeadlineData } from "../utils/BaseHeadlineTransformationUtils.js";

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {@link BaseHeadline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
export function MultiMeasuresTransformation({
    dataView,
    drillableItems,
    config,
    onAfterRender,
    onDrill,
}: IHeadlineTransformationProps) {
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
}
