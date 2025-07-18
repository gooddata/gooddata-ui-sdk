// (C) 2023-2025 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import BaseHeadline from "../headlines/baseHeadline/BaseHeadline.js";
import { useFireDrillEvent } from "./useFiredDrillEvent.js";
import { getComparisonBaseHeadlineData } from "../utils/ComparisonTransformationUtils.js";
import { IChartConfig } from "../../../../interfaces/index.js";
import { COMPARISON_DEFAULT_OBJECT } from "../interfaces/BaseHeadlines.js";

export default function ComparisonTransformation({
    dataView,
    drillableItems,
    config,
    onAfterRender,
    onDrill,
}: IHeadlineTransformationProps) {
    const baseHeadlineConfig: IChartConfig = config?.comparison
        ? config
        : {
              ...config,
              comparison: COMPARISON_DEFAULT_OBJECT,
          };

    const { comparison } = baseHeadlineConfig;

    const intl = useIntl();
    const { handleFiredDrillEvent } = useFireDrillEvent(dataView, onDrill);

    const data = useMemo(
        () => getComparisonBaseHeadlineData(dataView, drillableItems, comparison, intl),
        [dataView, drillableItems, comparison, intl],
    );

    return (
        <BaseHeadline
            data={data}
            config={baseHeadlineConfig}
            onDrill={handleFiredDrillEvent}
            onAfterRender={onAfterRender}
        />
    );
}
