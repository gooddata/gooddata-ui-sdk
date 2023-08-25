// (C) 2023 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import BaseHeadline from "../headlines/baseHeadline/BaseHeadline.js";
import { useFireDrillEvent } from "./useFiredDrillEvent.js";
import { getComparisonBaseHeadlineData } from "../utils/ComparisonTransformationUtils.js";

const ComparisonTransformation: React.FC<IHeadlineTransformationProps> = ({
    dataView,
    drillableItems,
    config,
    onAfterRender,
    onDrill,
}) => {
    const { comparison } = config;
    const intl = useIntl();
    const { handleFiredDrillEvent } = useFireDrillEvent(dataView, onDrill);

    const data = useMemo(
        () => getComparisonBaseHeadlineData(dataView, drillableItems, comparison, intl),
        [dataView, drillableItems, comparison, intl],
    );

    return (
        <BaseHeadline
            data={data}
            config={config}
            onDrill={handleFiredDrillEvent}
            onAfterRender={onAfterRender}
        />
    );
};

export default ComparisonTransformation;
