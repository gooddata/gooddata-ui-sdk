// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IIconProps } from "@gooddata/sdk-ui-kit";

import { AreaMeasures } from "./icons/AreaMeasures.js";
import { AreaStack } from "./icons/AreaStack.js";
import { AreaView } from "./icons/AreaView.js";
import { BarMeasures } from "./icons/BarMeasures.js";
import { BarStack } from "./icons/BarStack.js";
import { BarView } from "./icons/BarView.js";
import { BubbleMeasuresX } from "./icons/BubbleMeasuresX.js";
import { BubbleMeasuresY } from "./icons/BubbleMeasuresY.js";
import { BubbleSize } from "./icons/BubbleSize.js";
import { BubbleViewBy } from "./icons/BubbleViewBy.js";
import { BulletComparative } from "./icons/BulletComparative.js";
import { BulletPrimary } from "./icons/BulletPrimary.js";
import { BulletTarget } from "./icons/BulletTarget.js";
import { BulletViewBy } from "./icons/BulletViewBy.js";
import { ColumnMeasures } from "./icons/ColumnMeasures.js";
import { ColumnStack } from "./icons/ColumnStack.js";
import { ColumnView } from "./icons/ColumnView.js";
import { ComboMeasuresArea } from "./icons/ComboMeasuresArea.js";
import { ComboMeasuresColumn } from "./icons/ComboMeasuresColumn.js";
import { ComboMeasuresLine } from "./icons/ComboMeasuresLine.js";
import { ComboSecondaryMeasures } from "./icons/ComboSecondaryMeasures.js";
import { ComboViewColumnArea } from "./icons/ComboViewColumnArea.js";
import { ComboViewColumnLine } from "./icons/ComboViewColumnLine.js";
import { ComboViewLineArea } from "./icons/ComboViewLineArea.js";
import { ComboViewLineLine } from "./icons/ComboViewLineLine.js";
import { DependencyWheelFrom } from "./icons/DependencyWheelFrom.js";
import { DependencyWheelMeasures } from "./icons/DependencyWheelMeasures.js";
import { DependencyWheelTo } from "./icons/DependencyWheelTo.js";
import { DonutMeasures } from "./icons/DonutMeasures.js";
import { DonutView } from "./icons/DonutView.js";
import { FunnelMeasures } from "./icons/FunnelMeasures.js";
import { FunnelView } from "./icons/FunnelView.js";
import { GeoPushpinColorIcon } from "./icons/GeoPushpinColorIcon.js";
import { GeoPushpinLocationIcon } from "./icons/GeoPushpinLocationIcon.js";
import { GeoPushpinSegmentIcon } from "./icons/GeoPushpinSegmentIcon.js";
import { GeoPushpinSizeIcon } from "./icons/GeoPushpinSizeIcon.js";
import { HeadlineMeasures } from "./icons/HeadlineMeasures.js";
import { HeadlineSecondaryMeasures } from "./icons/HeadlineSecondaryMeasures.js";
import { HeatmapMeasures } from "./icons/HeatmapMeasures.js";
import { HeatmapStack } from "./icons/HeatmapStack.js";
import { HeatmapView } from "./icons/HeatmapView.js";
import { LineMeasures } from "./icons/LineMeasures.js";
import { LineSegment } from "./icons/LineSegment.js";
import { LineTrend } from "./icons/LineTrend.js";
import { MekkoHeight } from "./icons/MekkoHeight.js";
import { MekkoStack } from "./icons/MekkoStack.js";
import { MekkoView } from "./icons/MekkoView.js";
import { MekkoWidth } from "./icons/MekkoWidth.js";
import { PieMeasures } from "./icons/PieMeasures.js";
import { PieView } from "./icons/PieView.js";
import { PyramidMeasures } from "./icons/PyramidMeasures.js";
import { PyramidView } from "./icons/PyramidView.js";
import { RadarMeasures } from "./icons/RadarMeasures.js";
import { RadarSegment } from "./icons/RadarSegment.js";
import { RadarTrend } from "./icons/RadarTrend.js";
import { RepeaterColumns } from "./icons/RepeaterColumns.js";
import { RepeaterRows } from "./icons/RepeaterRows.js";
import { RepeaterView } from "./icons/RepeaterView.js";
import { SankeyFrom } from "./icons/SankeyFrom.js";
import { SankeyMeasures } from "./icons/SankeyMeasures.js";
import { SankeyTo } from "./icons/SankeyTo.js";
import { ScatterAttribute } from "./icons/ScatterAttribute.js";
import { ScatterMeasuresX } from "./icons/ScatterMeasuresX.js";
import { ScatterMeasuresY } from "./icons/ScatterMeasuresY.js";
import { ScatterSegment } from "./icons/ScatterSegment.js";
import { ScatterView } from "./icons/ScatterView.js";
import { TableColumns } from "./icons/TableColumns.js";
import { TableMeasures } from "./icons/TableMeasures.js";
import { TableRows } from "./icons/TableRows.js";
import { TreemapMeasures } from "./icons/TreemapMeasures.js";
import { TreemapSegment } from "./icons/TreemapSegment.js";
import { TreemapView } from "./icons/TreemapView.js";
import { WaterfallMeasures } from "./icons/WaterfallMeasures.js";
import { WaterfallView } from "./icons/WaterfallView.js";

/**
 * Renders a bucket title icon. Typed as a plain render function rather than a component so callers
 * can invoke it during render, the same way the ui-kit InsightIcon renders its map entries.
 *
 * @internal
 */
export type BucketIconRenderer = (props: IIconProps) => ReactElement;

/**
 * Bucket title icons keyed by the `local:` ids the uiConfig helpers put into `IBucketUiConfig.icon`.
 */
const BUCKET_ICONS: Record<string, BucketIconRenderer> = {
    "local:area/bucket-title-measures.svg": AreaMeasures,
    "local:area/bucket-title-stack.svg": AreaStack,
    "local:area/bucket-title-view.svg": AreaView,
    "local:bar/bucket-title-measures.svg": BarMeasures,
    "local:bar/bucket-title-stack.svg": BarStack,
    "local:bar/bucket-title-view.svg": BarView,
    "local:bubble/bucket-title-measures-x.svg": BubbleMeasuresX,
    "local:bubble/bucket-title-measures-y.svg": BubbleMeasuresY,
    "local:bubble/bucket-title-size.svg": BubbleSize,
    "local:bubble/bucket-title-view-by.svg": BubbleViewBy,
    "local:bullet/bucket-title-comparative.svg": BulletComparative,
    "local:bullet/bucket-title-primary.svg": BulletPrimary,
    "local:bullet/bucket-title-target.svg": BulletTarget,
    "local:bullet/bucket-title-view-by.svg": BulletViewBy,
    "local:column/bucket-title-measures.svg": ColumnMeasures,
    "local:column/bucket-title-stack.svg": ColumnStack,
    "local:column/bucket-title-view.svg": ColumnView,
    "local:combo/bucket-title-measures-area.svg": ComboMeasuresArea,
    "local:combo/bucket-title-measures-column.svg": ComboMeasuresColumn,
    "local:combo/bucket-title-measures-line.svg": ComboMeasuresLine,
    "local:combo/bucket-title-secondary-measures.svg": ComboSecondaryMeasures,
    "local:combo/bucket-title-view-column-area.svg": ComboViewColumnArea,
    "local:combo/bucket-title-view-column-line.svg": ComboViewColumnLine,
    "local:combo/bucket-title-view-line-area.svg": ComboViewLineArea,
    "local:combo/bucket-title-view-line-line.svg": ComboViewLineLine,
    "local:dependencyWheel/bucket-title-from.svg": DependencyWheelFrom,
    "local:dependencyWheel/bucket-title-measures.svg": DependencyWheelMeasures,
    "local:dependencyWheel/bucket-title-to.svg": DependencyWheelTo,
    "local:donut/bucket-title-measures.svg": DonutMeasures,
    "local:donut/bucket-title-view.svg": DonutView,
    "local:funnel/bucket-title-measures.svg": FunnelMeasures,
    "local:funnel/bucket-title-view.svg": FunnelView,
    "local:geoPushpin/bucket-title-color-icon.svg": GeoPushpinColorIcon,
    "local:geoPushpin/bucket-title-location-icon.svg": GeoPushpinLocationIcon,
    "local:geoPushpin/bucket-title-segment-icon.svg": GeoPushpinSegmentIcon,
    "local:geoPushpin/bucket-title-size-icon.svg": GeoPushpinSizeIcon,
    "local:headline/bucket-title-measures.svg": HeadlineMeasures,
    "local:headline/bucket-title-secondary-measures.svg": HeadlineSecondaryMeasures,
    "local:heatmap/bucket-title-measures.svg": HeatmapMeasures,
    "local:heatmap/bucket-title-stack.svg": HeatmapStack,
    "local:heatmap/bucket-title-view.svg": HeatmapView,
    "local:line/bucket-title-measures.svg": LineMeasures,
    "local:line/bucket-title-segment.svg": LineSegment,
    "local:line/bucket-title-trend.svg": LineTrend,
    "local:mekko/bucket-title-height.svg": MekkoHeight,
    "local:mekko/bucket-title-stack.svg": MekkoStack,
    "local:mekko/bucket-title-view.svg": MekkoView,
    "local:mekko/bucket-title-width.svg": MekkoWidth,
    "local:pie/bucket-title-measures.svg": PieMeasures,
    "local:pie/bucket-title-view.svg": PieView,
    "local:pyramid/bucket-title-measures.svg": PyramidMeasures,
    "local:pyramid/bucket-title-view.svg": PyramidView,
    "local:radar/bucket-title-measures.svg": RadarMeasures,
    "local:radar/bucket-title-segment.svg": RadarSegment,
    "local:radar/bucket-title-trend.svg": RadarTrend,
    "local:repeater/bucket-title-columns.svg": RepeaterColumns,
    "local:repeater/bucket-title-rows.svg": RepeaterRows,
    "local:repeater/bucket-title-view.svg": RepeaterView,
    "local:sankey/bucket-title-from.svg": SankeyFrom,
    "local:sankey/bucket-title-measures.svg": SankeyMeasures,
    "local:sankey/bucket-title-to.svg": SankeyTo,
    "local:scatter/bucket-title-attribute.svg": ScatterAttribute,
    "local:scatter/bucket-title-measures-x.svg": ScatterMeasuresX,
    "local:scatter/bucket-title-measures-y.svg": ScatterMeasuresY,
    "local:scatter/bucket-title-segment.svg": ScatterSegment,
    "local:scatter/bucket-title-view.svg": ScatterView,
    "local:table/bucket-title-columns.svg": TableColumns,
    "local:table/bucket-title-measures.svg": TableMeasures,
    "local:table/bucket-title-rows.svg": TableRows,
    "local:treemap/bucket-title-measures.svg": TreemapMeasures,
    "local:treemap/bucket-title-segment.svg": TreemapSegment,
    "local:treemap/bucket-title-view.svg": TreemapView,
    "local:waterfall/bucket-title-measures.svg": WaterfallMeasures,
    "local:waterfall/bucket-title-view.svg": WaterfallView,
};

/**
 * Resolves a bucket icon id to its render function.
 *
 * @returns the renderer for a known `local:` id, undefined for anything else
 *
 * @internal
 */
export function getBucketIcon(icon: string | undefined): BucketIconRenderer | undefined {
    // Own-property check so ids like "constructor" do not resolve to Object.prototype members.
    return icon && Object.hasOwn(BUCKET_ICONS, icon) ? BUCKET_ICONS[icon] : undefined;
}
