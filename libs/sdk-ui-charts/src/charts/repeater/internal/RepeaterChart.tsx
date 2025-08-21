// (C) 2024-2025 GoodData Corporation

import React, { useMemo, useState } from "react";

import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    ModuleRegistry,
    provideGlobalGridOptions,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import cx from "classnames";
import stringify from "json-stable-stringify";
import isNil from "lodash/isNil.js";
import { useIntl } from "react-intl";

import {
    IAttribute,
    IAttributeDescriptor,
    IAttributeOrMeasure,
    IMeasure,
    IResultAttributeHeaderItem,
    attributeLocalId,
    bucketsFind,
    isMeasure,
    measureLocalId,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, LoadingComponent, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";
import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";
import { InlineColumnChart } from "./InlineColumnChart.js";
import { InlineLineChart } from "./InlineLineChart.js";
import { AgGridDatasource } from "./repeaterAgGridDataSource.js";
import { IChartConfig } from "../../../interfaces/index.js";
import { useDrilling } from "../hooks/useDrilling.js";
import { useFocusMng } from "../hooks/useFocusMng.js";
import { useRenderWatcher } from "../hooks/useRenderWatcher.js";
import { MANUALLY_SIZED_MIN_WIDTH, useResizing } from "../hooks/useResizing.js";
import { IRepeaterChartProps } from "../publicTypes.js";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({ theme: "legacy" });

const DEFAULT_COL_DEF: ColDef = { resizable: true, sortable: false };

export function RepeaterChart(props: IRepeaterChartProps) {
    const { dataView, onError, config, afterRender } = props;
    const dataSource = useMemo(
        () => new AgGridDatasource(dataView, { onError }, config),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dataView.fingerprint(), onError, config],
    );

    const rowHeight = getRowHeight(config);

    const items = useMemo(() => {
        const columnsBucket = bucketsFind(dataView.definition.buckets, BucketNames.COLUMNS);

        return columnsBucket.items ?? [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataView.fingerprint()]);

    const columnDefs = useMemo(() => {
        let measureIndex = 0;
        return items.map((bucketItem): ColDef => {
            const sharedColDef: ColDef = {
                headerName: getRepeaterColumnTitle(bucketItem, dataView, config.enableAliasAttributeLabel),
                field: getRepeaterColumnId(bucketItem),
                cellClass: "gd-cell",
                minWidth: MANUALLY_SIZED_MIN_WIDTH,
            };
            if (isMeasure(bucketItem)) {
                const localId = measureLocalId(bucketItem);
                const measureTitle = getMetricTitle(bucketItem, dataView);
                const viewByAttributeLocalId = getViewByAttributeLocalId(dataView);
                const viewByAttributeTitle = getViewByAttributeTitle(dataView);
                const measureColor = getMetricColor(bucketItem, dataView, config, measureIndex);
                measureIndex = measureIndex + 1;

                return {
                    ...sharedColDef,
                    cellRenderer: function CellRenderer(props: ICellRendererParams) {
                        const { node } = props;
                        const measureColumnData = props.value as IMeasureColumnData;
                        const isLoading = node.id === undefined;

                        return (
                            <MeasureCellRenderer
                                measureColumnData={measureColumnData}
                                isLoading={isLoading}
                            />
                        );
                    },
                    valueGetter: (params): IMeasureColumnData => {
                        return {
                            measureLocalId: localId,
                            measureTitle,
                            measureDataPoints: params.data?.[localId],
                            viewByAttributeTitle,
                            viewByAttributeHeaderItems: params.data?.[viewByAttributeLocalId] ?? [],
                            config,
                            measureColor,
                        };
                    },
                };
            } else {
                const attributeDescriptors = dataView.meta().attributeDescriptors();
                const localIdentifier = attributeLocalId(bucketItem);
                const attributeDescriptor = attributeDescriptors.find(
                    (descriptor) => descriptor.attributeHeader.localIdentifier === localIdentifier,
                );
                const renderingType = getAttributeRenderingType(attributeDescriptor);

                return {
                    ...sharedColDef,
                    cellRenderer: function CellRenderer(props: ICellRendererParams) {
                        const { node } = props;
                        const attributeColumnData = props.value as IAttributeColumnData;
                        const isLoading = node.id === undefined;

                        return (
                            <AttributeCellRenderer
                                attributeColumnData={attributeColumnData}
                                isLoading={isLoading}
                            />
                        );
                    },
                    valueGetter: (params): IAttributeColumnData => {
                        return {
                            attributeLocalId: localIdentifier,
                            value: params.data?.[localIdentifier]?.name,
                            config,
                            renderingType,
                        };
                    },
                };
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        items,
        config?.cellVerticalAlign,
        config?.cellTextWrapping,
        config?.cellImageSizing,
        config?.hyperLinks,
        config?.inlineVisualizations,
    ]);

    const {
        onColumnResized,
        onGridReady: onResizingGridReady,
        containerRef,
    } = useResizing(columnDefs, items, props);
    const {
        onCellClicked,
        onCellKeyDown,
        onGridReady: onDrillingGridReady,
    } = useDrilling(columnDefs, items, props);

    const { onFirstDataRendered } = useRenderWatcher(afterRender);

    const { switchToBrowserDefault, focusGridInnerElement } = useFocusMng();

    return (
        <div className="gd-repeater s-repeater" ref={containerRef}>
            <AgGridReact
                className="ag-theme-balham"
                key={stringify({
                    rowHeight,
                    cellVerticalAlign: config?.cellVerticalAlign,
                    cellTextWrapping: config?.cellTextWrapping,
                    cellImageSizing: config?.cellImageSizing,
                    dataView: dataView.fingerprint(),
                    hyperLinks: config?.hyperLinks,
                    onError: onError?.toString(),
                })}
                defaultColDef={DEFAULT_COL_DEF}
                modules={[AllCommunityModule]}
                columnDefs={columnDefs}
                rowClass="gd-table-row"
                datasource={dataSource}
                rowModelType="infinite"
                rowHeight={rowHeight}
                suppressCellFocus={false}
                suppressHeaderFocus={false}
                suppressMovableColumns={true}
                onCellClicked={onCellClicked}
                onCellKeyDown={onCellKeyDown}
                focusGridInnerElement={focusGridInnerElement}
                tabToNextHeader={switchToBrowserDefault}
                tabToNextCell={switchToBrowserDefault}
                onGridReady={(e) => {
                    onResizingGridReady(e);
                    onDrillingGridReady(e);
                }}
                onColumnResized={onColumnResized}
                onFirstDataRendered={onFirstDataRendered}
            />
        </div>
    );
}

interface IRepeaterImageProps {
    src?: string;
}

function RepeaterImage({ src }: IRepeaterImageProps) {
    const [imageLoadError, setImageLoadError] = useState(false);

    if (!src || imageLoadError) {
        return (
            <div className="gd-repeater-image-empty">
                <Icon.Image />
            </div>
        );
    }

    return <img className="gd-repeater-image" src={src} alt={src} onError={() => setImageLoadError(true)} />;
}

function RepeaterHyperLink({ value, hyperlinkStaticText }: { value?: string; hyperlinkStaticText?: string }) {
    const intl = useIntl();
    return value ? (
        <a className="gd-repeater-link" href={value} target="_blank" rel="noopener noreferrer">
            {hyperlinkStaticText || value}
        </a>
    ) : (
        emptyHeaderTitleFromIntl(intl)
    );
}

interface IMeasureColumnData {
    measureLocalId: string;
    measureTitle: string;
    measureDataPoints: RepeaterInlineVisualizationDataPoint[];
    measureColor: string;

    viewByAttributeTitle?: string;
    viewByAttributeHeaderItems?: IResultAttributeHeaderItem[];

    config: IChartConfig;
}

function MeasureCellRenderer({
    measureColumnData,
    isLoading,
}: {
    measureColumnData: IMeasureColumnData;
    isLoading: boolean;
}) {
    const {
        measureLocalId,
        measureTitle,
        config,
        viewByAttributeTitle,
        measureDataPoints,
        viewByAttributeHeaderItems,
    } = measureColumnData;
    const rowHeight = getRowHeight(config);
    const visualizationType = getInlineVisualizationType(measureLocalId, config);
    const theme = useTheme();
    const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;

    if (isLoading) {
        return <LoadingComponent color={color} width={36} imageHeight={8} height={rowHeight} speed={2} />;
    }

    if (visualizationType === "line") {
        return (
            <InlineLineChart
                metricTitle={measureTitle}
                sliceTitle={viewByAttributeTitle}
                data={measureDataPoints}
                color={measureColumnData.measureColor}
                headerItems={viewByAttributeHeaderItems}
                height={rowHeight}
            />
        );
    } else if (visualizationType === "column") {
        return (
            <InlineColumnChart
                metricTitle={measureTitle}
                sliceTitle={viewByAttributeTitle}
                data={measureDataPoints}
                color={measureColumnData.measureColor}
                headerItems={viewByAttributeHeaderItems}
                height={rowHeight}
            />
        );
    }

    const verticalAlign = getVerticalAlign(config);
    const textWrapping = getTextWrapping(config);

    return (
        <div
            className={cx(
                "gd-repeater-cell-wrapper",
                `gd-vertical-align-${verticalAlign}`,
                `gd-text-wrapping-${textWrapping}`,
            )}
        >
            {measureDataPoints.find((point) => !isNil(point.value))?.formattedValue}
        </div>
    );
}

interface IAttributeColumnData {
    value: string | null;
    attributeLocalId: string;
    renderingType: "image" | "hyperlink" | "text";
    config: IChartConfig;
}

function AttributeCellRenderer({
    attributeColumnData,
    isLoading,
}: {
    attributeColumnData: IAttributeColumnData;
    isLoading: boolean;
}) {
    const { config, attributeLocalId, value, renderingType } = attributeColumnData;
    const rowHeight = getRowHeight(config);
    const intl = useIntl();
    const theme = useTheme();
    const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;
    if (isLoading) {
        return <LoadingComponent color={color} width={36} imageHeight={8} height={rowHeight} speed={2} />;
    }

    let renderValue: React.ReactNode = value || emptyHeaderTitleFromIntl(intl);
    if (renderingType === "text") {
        renderValue = <span>{renderValue}</span>;
    } else if (renderingType === "hyperlink") {
        const hyperlinkStaticText = getHyperLinkStaticElementsText(attributeLocalId, config);
        renderValue = <RepeaterHyperLink hyperlinkStaticText={hyperlinkStaticText} value={value} />;
    } else if (renderingType === "image") {
        renderValue = <RepeaterImage src={value} />;
    }

    const verticalAlign = getVerticalAlign(config);
    const textWrapping = getTextWrapping(config);
    const imageSizing = getImageSizing(config);

    return (
        <div
            className={cx(
                "gd-repeater-cell-wrapper",
                `gd-vertical-align-${verticalAlign}`,
                `gd-row-height-${rowHeight}`,
                `gd-text-wrapping-${textWrapping}`,
                `gd-image-sizing-${imageSizing}`,
            )}
        >
            {renderValue}
        </div>
    );
}

const SMALL_ROW_HEIGHT = 25;
const MEDIUM_ROW_HEIGHT = 55;
const LARGE_ROW_HEIGHT = 85;
function getRowHeight(config?: IChartConfig) {
    const rowHeight = config?.rowHeight;
    switch (rowHeight) {
        case "small":
            return SMALL_ROW_HEIGHT;
        case "medium":
            return MEDIUM_ROW_HEIGHT;
        case "large":
            return LARGE_ROW_HEIGHT;
        default:
            return SMALL_ROW_HEIGHT;
    }
}

function getVerticalAlign(config?: IChartConfig) {
    return config?.cellVerticalAlign ?? "top";
}

function getTextWrapping(config?: IChartConfig) {
    return config?.cellTextWrapping ?? "clip";
}

function getImageSizing(config?: IChartConfig) {
    return config?.cellImageSizing ?? "fit";
}

function getRepeaterColumnTitle(
    columnBucketItem: IAttributeOrMeasure,
    dataView: DataViewFacade,
    enableAliasAttributeLabel?: boolean,
) {
    if (isMeasure(columnBucketItem)) {
        return getMetricTitle(columnBucketItem, dataView);
    }

    return getAttributeTitle(columnBucketItem, dataView, enableAliasAttributeLabel);
}

function getRepeaterColumnId(columnBucketItem: IAttributeOrMeasure) {
    if (isMeasure(columnBucketItem)) {
        return measureLocalId(columnBucketItem);
    }

    return attributeLocalId(columnBucketItem);
}

function getMetricColor(measure: IMeasure, dataView: DataViewFacade, config: IChartConfig, index: number) {
    const descriptor = getMetricDescriptor(measure, dataView);
    const colorPalette = config?.colorPalette;
    const colorMappingForMeasure = config?.colorMapping?.find((cm) =>
        cm.predicate?.(descriptor, { dv: dataView }),
    );
    let color: string;
    if (colorMappingForMeasure?.color?.type === "rgb") {
        const rgbColor = colorMappingForMeasure.color.value;
        color = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
    } else if (colorMappingForMeasure?.color?.type === "guid") {
        const paletteColor = colorPalette?.find((c) => c.guid === colorMappingForMeasure.color.value);
        if (paletteColor) {
            const rgbColor = paletteColor.fill;
            color = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
        }
    }

    if (!color) {
        const paletteColor = colorPalette?.[index];
        if (paletteColor) {
            const rgbColor = paletteColor.fill;
            color = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
        } else {
            color = "#14B2E2";
        }
    }

    return color;
}

function getMetricTitle(measure: IMeasure, dataView: DataViewFacade) {
    const measureDescriptor = getMetricDescriptor(measure, dataView);
    return measureDescriptor?.measureHeaderItem?.name;
}

function getMetricDescriptor(measure: IMeasure, dataView: DataViewFacade) {
    const localId = measureLocalId(measure);
    const measureDescriptors = dataView.meta().measureDescriptors();
    return measureDescriptors.find((descriptor) => descriptor.measureHeaderItem.localIdentifier === localId);
}

function getAttributeTitle(
    attribute: IAttribute,
    dataView: DataViewFacade,
    enableAliasAttributeLabel = false,
) {
    const localId = attributeLocalId(attribute);
    const attributeDescriptors = dataView.meta().attributeDescriptors();
    const attributeDescriptor = attributeDescriptors.find(
        (descriptor) => descriptor.attributeHeader.localIdentifier === localId,
    );
    return enableAliasAttributeLabel
        ? attributeDescriptor?.attributeHeader?.formOf.name
        : attributeDescriptor?.attributeHeader?.name;
}

function getInlineVisualizationType(measureLocalId: string, config: IChartConfig) {
    return config?.inlineVisualizations?.[measureLocalId]?.type ?? "metric";
}

function getViewByAttributeLocalId(dataView: DataViewFacade) {
    const viewBucket = bucketsFind(dataView.definition.buckets, BucketNames.VIEW);
    const viewAttribute = viewBucket?.items?.[0] as IAttribute | undefined;
    return viewAttribute ? attributeLocalId(viewAttribute) : undefined;
}

function getViewByAttributeDescriptor(dataView: DataViewFacade) {
    const attributeDescriptors = dataView.meta().attributeDescriptors();
    const viewAttributeLocalId = getViewByAttributeLocalId(dataView);
    return attributeDescriptors.find((d) => d.attributeHeader.localIdentifier === viewAttributeLocalId);
}

function getViewByAttributeTitle(dataView: DataViewFacade) {
    return getViewByAttributeDescriptor(dataView)?.attributeHeader?.name;
}

function getAttributeRenderingType(
    attributeDescriptor: IAttributeDescriptor,
): "image" | "hyperlink" | "text" {
    const labelType = attributeDescriptor.attributeHeader.labelType;
    if (labelType === "GDC.image") {
        return "image";
    } else if (labelType === "GDC.link") {
        return "hyperlink";
    }

    return "text";
}

function getHyperLinkStaticElementsText(attributeLocalId: string, config: IChartConfig) {
    return config?.hyperLinks?.[attributeLocalId]?.staticElementsText;
}
