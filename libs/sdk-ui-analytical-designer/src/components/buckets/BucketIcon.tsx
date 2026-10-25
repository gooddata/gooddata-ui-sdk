// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import areaMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/area/bucket-title-measures.svg";
import areaStackIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/area/bucket-title-stack.svg";
import areaViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/area/bucket-title-view.svg";
import barMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bar/bucket-title-measures.svg";
import barStackIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bar/bucket-title-stack.svg";
import barViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bar/bucket-title-view.svg";
import bubbleMeasuresXIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bubble/bucket-title-measures-x.svg";
import bubbleMeasuresYIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bubble/bucket-title-measures-y.svg";
import bubbleSizeIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bubble/bucket-title-size.svg";
import bubbleViewByIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bubble/bucket-title-view-by.svg";
import bulletComparativeMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bullet/bucket-title-comparative.svg";
import bulletPrimaryMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bullet/bucket-title-primary.svg";
import bulletTargetMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bullet/bucket-title-target.svg";
import bulletViewByIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/bullet/bucket-title-view-by.svg";
import columnMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/column/bucket-title-measures.svg";
import columnStackIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/column/bucket-title-stack.svg";
import columnViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/column/bucket-title-view.svg";
import areaMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-measures-area.svg";
import columnMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-measures-column.svg";
import lineMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-measures-line.svg";
import comboSecondaryMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-secondary-measures.svg";
import columnAreaIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-view-column-area.svg";
import columnLineIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-view-column-line.svg";
import lineAreaIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-view-line-area.svg";
import lineViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/combo/bucket-title-view-line-line.svg";
import dependencyWheelAttributeFromIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/dependencyWheel/bucket-title-from.svg";
import dependencyWheelMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/dependencyWheel/bucket-title-measures.svg";
import dependencyWheelAttributeToIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/dependencyWheel/bucket-title-to.svg";
import donutMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/donut/bucket-title-measures.svg";
import donutViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/donut/bucket-title-view.svg";
import funnelMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/funnel/bucket-title-measures.svg";
import funnelViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/funnel/bucket-title-view.svg";
import geoPushPinBucketColorIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/geoPushpin/bucket-title-color-icon.svg";
import geoPushPinBucketLocationIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/geoPushpin/bucket-title-location-icon.svg";
import geoPushPinBucketSegmentIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/geoPushpin/bucket-title-segment-icon.svg";
import geoPushPinBucketSizeIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/geoPushpin/bucket-title-size-icon.svg";
import headlineMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/headline/bucket-title-measures.svg";
import headlineSecondaryMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/headline/bucket-title-secondary-measures.svg";
import heatmapMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/heatmap/bucket-title-measures.svg";
import heatmapStackIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/heatmap/bucket-title-stack.svg";
import heatmapViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/heatmap/bucket-title-view.svg";
import lineMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/line/bucket-title-measures.svg";
import lineSegmentIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/line/bucket-title-segment.svg";
import lineTrendIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/line/bucket-title-trend.svg";
import mekkoHeightIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/mekko/bucket-title-height.svg";
import mekkoStackIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/mekko/bucket-title-stack.svg";
import mekkoViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/mekko/bucket-title-view.svg";
import mekkoWidthIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/mekko/bucket-title-width.svg";
import pieMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/pie/bucket-title-measures.svg";
import pieViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/pie/bucket-title-view.svg";
import pyramidMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/pyramid/bucket-title-measures.svg";
import pyramidViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/pyramid/bucket-title-view.svg";
import radarMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/radar/bucket-title-measures.svg";
import radarSegmentIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/radar/bucket-title-segment.svg";
import radarTrendIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/radar/bucket-title-trend.svg";
import repeaterColumnsIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/repeater/bucket-title-columns.svg";
import repeaterRowsIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/repeater/bucket-title-rows.svg";
import repeaterViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/repeater/bucket-title-view.svg";
import sankeyAttributeFromIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/sankey/bucket-title-from.svg";
import sankeyMeasureIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/sankey/bucket-title-measures.svg";
import sankeyAttributeToIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/sankey/bucket-title-to.svg";
import scatterAttributeIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/scatter/bucket-title-attribute.svg";
import scatterMeasuresXIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/scatter/bucket-title-measures-x.svg";
import scatterMeasuresYIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/scatter/bucket-title-measures-y.svg";
import scatterSegmentIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/scatter/bucket-title-segment.svg";
import scatterViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/scatter/bucket-title-view.svg";
import tableColumnsIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/table/bucket-title-columns.svg";
import tableMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/table/bucket-title-measures.svg";
import tableRowsIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/table/bucket-title-rows.svg";
import treemapMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/treemap/bucket-title-measures.svg";
import treemapSegmentIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/treemap/bucket-title-segment.svg";
import treemapViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/treemap/bucket-title-view.svg";
import waterfallMeasuresIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/waterfall/bucket-title-measures.svg";
import waterfallViewIcon from "@gooddata/sdk-ui-ext/esm/internal/assets/waterfall/bucket-title-view.svg";

const localBucketIcons: Record<string, string> = {
    "area/bucket-title-measures.svg": areaMeasuresIcon,
    "area/bucket-title-view.svg": areaViewIcon,
    "area/bucket-title-stack.svg": areaStackIcon,
    "column/bucket-title-measures.svg": columnMeasuresIcon,
    "column/bucket-title-view.svg": columnViewIcon,
    "column/bucket-title-stack.svg": columnStackIcon,
    "bar/bucket-title-measures.svg": barMeasuresIcon,
    "bar/bucket-title-view.svg": barViewIcon,
    "bar/bucket-title-stack.svg": barStackIcon,
    "bubble/bucket-title-measures-x.svg": bubbleMeasuresXIcon,
    "bubble/bucket-title-measures-y.svg": bubbleMeasuresYIcon,
    "bubble/bucket-title-size.svg": bubbleSizeIcon,
    "bubble/bucket-title-view-by.svg": bubbleViewByIcon,
    "bullet/bucket-title-primary.svg": bulletPrimaryMeasureIcon,
    "bullet/bucket-title-target.svg": bulletTargetMeasureIcon,
    "bullet/bucket-title-comparative.svg": bulletComparativeMeasureIcon,
    "bullet/bucket-title-view-by.svg": bulletViewByIcon,
    "combo/bucket-title-measures-column.svg": columnMeasureIcon,
    "combo/bucket-title-measures-line.svg": lineMeasureIcon,
    "combo/bucket-title-measures-area.svg": areaMeasureIcon,
    "combo/bucket-title-view-column-line.svg": columnLineIcon,
    "combo/bucket-title-view-column-area.svg": columnAreaIcon,
    "combo/bucket-title-view-line-area.svg": lineAreaIcon,
    "combo/bucket-title-view-line-line.svg": lineViewIcon,
    "combo/bucket-title-secondary-measures.svg": comboSecondaryMeasuresIcon,
    "donut/bucket-title-measures.svg": donutMeasuresIcon,
    "donut/bucket-title-view.svg": donutViewIcon,
    "funnel/bucket-title-measures.svg": funnelMeasuresIcon,
    "funnel/bucket-title-view.svg": funnelViewIcon,
    "pyramid/bucket-title-measures.svg": pyramidMeasuresIcon,
    "pyramid/bucket-title-view.svg": pyramidViewIcon,
    "geoPushpin/bucket-title-location-icon.svg": geoPushPinBucketLocationIcon,
    "geoPushpin/bucket-title-size-icon.svg": geoPushPinBucketSizeIcon,
    "geoPushpin/bucket-title-color-icon.svg": geoPushPinBucketColorIcon,
    "geoPushpin/bucket-title-segment-icon.svg": geoPushPinBucketSegmentIcon,
    "headline/bucket-title-measures.svg": headlineMeasuresIcon,
    "headline/bucket-title-secondary-measures.svg": headlineSecondaryMeasuresIcon,
    "heatmap/bucket-title-measures.svg": heatmapMeasuresIcon,
    "heatmap/bucket-title-view.svg": heatmapViewIcon,
    "heatmap/bucket-title-stack.svg": heatmapStackIcon,
    "line/bucket-title-measures.svg": lineMeasuresIcon,
    "line/bucket-title-trend.svg": lineTrendIcon,
    "line/bucket-title-segment.svg": lineSegmentIcon,
    "pie/bucket-title-measures.svg": pieMeasuresIcon,
    "pie/bucket-title-view.svg": pieViewIcon,
    "table/bucket-title-measures.svg": tableMeasuresIcon,
    "table/bucket-title-rows.svg": tableRowsIcon,
    "table/bucket-title-columns.svg": tableColumnsIcon,
    "scatter/bucket-title-measures-x.svg": scatterMeasuresXIcon,
    "scatter/bucket-title-measures-y.svg": scatterMeasuresYIcon,
    "scatter/bucket-title-attribute.svg": scatterAttributeIcon,
    "scatter/bucket-title-view.svg": scatterViewIcon,
    "scatter/bucket-title-segment.svg": scatterSegmentIcon,
    "treemap/bucket-title-measures.svg": treemapMeasuresIcon,
    "treemap/bucket-title-view.svg": treemapViewIcon,
    "treemap/bucket-title-segment.svg": treemapSegmentIcon,
    "sankey/bucket-title-measures.svg": sankeyMeasureIcon,
    "sankey/bucket-title-from.svg": sankeyAttributeFromIcon,
    "sankey/bucket-title-to.svg": sankeyAttributeToIcon,
    "dependencyWheel/bucket-title-measures.svg": dependencyWheelMeasureIcon,
    "dependencyWheel/bucket-title-from.svg": dependencyWheelAttributeFromIcon,
    "dependencyWheel/bucket-title-to.svg": dependencyWheelAttributeToIcon,
    "waterfall/bucket-title-measures.svg": waterfallMeasuresIcon,
    "waterfall/bucket-title-view.svg": waterfallViewIcon,
    "radar/bucket-title-measures.svg": radarMeasuresIcon,
    "radar/bucket-title-trend.svg": radarTrendIcon,
    "radar/bucket-title-segment.svg": radarSegmentIcon,
    "repeater/bucket-title-rows.svg": repeaterRowsIcon,
    "repeater/bucket-title-columns.svg": repeaterColumnsIcon,
    "repeater/bucket-title-view.svg": repeaterViewIcon,
    "mekko/bucket-title-width.svg": mekkoWidthIcon,
    "mekko/bucket-title-height.svg": mekkoHeightIcon,
    "mekko/bucket-title-view.svg": mekkoViewIcon,
    "mekko/bucket-title-stack.svg": mekkoStackIcon,
};

function isLocalBucketIcon(icon: string) {
    return /^local:/.test(icon);
}

function getLocalBucketIcon(icon: string) {
    const localId = icon.replace("local:", "");
    return localBucketIcons[localId];
}

interface IBucketIconProps {
    icon: string;
}

export function BucketIcon({ icon }: IBucketIconProps) {
    const iconOrLocalIcon = isLocalBucketIcon(icon) ? getLocalBucketIcon(icon) : icon;

    const style = useMemo(() => {
        return iconOrLocalIcon
            ? {
                  backgroundImage: `url("${iconOrLocalIcon}")`,
              }
            : null;
    }, [iconOrLocalIcon]);

    return <div className="bucket-title-icon" style={style} />;
}
