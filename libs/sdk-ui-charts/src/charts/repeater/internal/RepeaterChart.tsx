// (C) 2024 GoodData Corporation

import React, { useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules, ColDef, ICellRendererParams } from "@ag-grid-community/all-modules";
import { BucketNames, DataViewFacade, LoadingComponent, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";
import { AgGridDatasource } from "./repeaterAgGridDataSource.js";
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
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";
import { IChartConfig } from "../../../interfaces/index.js";
import { Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import stringify from "json-stable-stringify";
import { InlineLineChart } from "./InlineLineChart.js";
import { InlineColumnChart } from "./InlineColumnChart.js";
import { RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";

interface IRepeaterChartProps {
    dataView: DataViewFacade;
    config?: IChartConfig;
    onError?: (error: any) => void;
}

const DEFAULT_COL_DEF = { resizable: true };

export const RepeaterChart: React.FC<IRepeaterChartProps> = ({ dataView, onError, config }) => {
    const dataSource = useMemo(
        () => new AgGridDatasource(dataView, { onError }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dataView.fingerprint(), onError],
    );

    const rowHeight = getRowHeight(config);

    const columnDefs = useMemo(() => {
        const columnsBucket = bucketsFind(dataView.definition.buckets, BucketNames.COLUMNS);

        return columnsBucket.items.map((bucketItem): ColDef => {
            const sharedColDef: ColDef = {
                headerName: getRepeaterColumnTitle(bucketItem, dataView),
                field: getRepeaterColumnId(bucketItem),
                cellClass: "gd-cell",
            };

            if (isMeasure(bucketItem)) {
                const localId = measureLocalId(bucketItem);
                const measureTitle = getMetricTitle(bucketItem, dataView);
                const viewByAttributeLocalId = getViewByAttributeLocalId(dataView);
                const viewByAttributeTitle = getViewByAttributeTitle(dataView);

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
    }, [dataView.fingerprint(), JSON.stringify(config)]);

    return (
        <div className="gd-repeater ag-theme-balham s-repeater">
            <AgGridReact
                key={stringify({
                    dataView: dataView.fingerprint(),
                    config,
                    onError: onError?.toString(),
                })}
                defaultColDef={DEFAULT_COL_DEF}
                modules={AllCommunityModules}
                columnDefs={columnDefs}
                rowClass="gd-table-row"
                datasource={dataSource}
                rowModelType="infinite"
                rowHeight={rowHeight}
            />
        </div>
    );
};

interface IRepeaterImageProps {
    src?: string;
}

function RepeaterImage({ src }: IRepeaterImageProps) {
    const [imageLoadError, setImageLoadError] = useState(false);

    if (!src || imageLoadError) {
        <div className="gd-repeater-image-empty">
            <Icon.Image />
        </div>;
    }

    return <img className="gd-repeater-image" src={src} alt={src} onError={() => setImageLoadError(true)} />;
}

function RepeaterHyperLink({ value, hyperlinkStaticText }: { value?: string; hyperlinkStaticText?: string }) {
    const intl = useIntl();
    return value ? (
        <a className="gd-repeater-link" href={value} target="_blank" rel="noopener noreferrer">
            {hyperlinkStaticText ? hyperlinkStaticText : value}
        </a>
    ) : (
        emptyHeaderTitleFromIntl(intl)
    );
}

interface IMeasureColumnData {
    measureLocalId: string;
    measureTitle: string;
    measureDataPoints: RepeaterInlineVisualizationDataPoint[];

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
                headerItems={viewByAttributeHeaderItems}
                height={rowHeight}
            />
        );
    }

    return <div>{measureDataPoints[0]?.formattedValue}</div>;
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

function getRepeaterColumnTitle(columnBucketItem: IAttributeOrMeasure, dataView: DataViewFacade) {
    if (isMeasure(columnBucketItem)) {
        return getMetricTitle(columnBucketItem, dataView);
    }

    return getAttributeTitle(columnBucketItem, dataView);
}

function getRepeaterColumnId(columnBucketItem: IAttributeOrMeasure) {
    if (isMeasure(columnBucketItem)) {
        return measureLocalId(columnBucketItem);
    }

    return attributeLocalId(columnBucketItem);
}

function getMetricTitle(measure: IMeasure, dataView: DataViewFacade) {
    const localId = measureLocalId(measure);
    const measureDescriptors = dataView.meta().measureDescriptors();
    const measureDescriptor = measureDescriptors.find(
        (descriptor) => descriptor.measureHeaderItem.localIdentifier === localId,
    );
    return measureDescriptor?.measureHeaderItem?.name;
}

function getAttributeTitle(attribute: IAttribute, dataView: DataViewFacade) {
    const localId = attributeLocalId(attribute);
    const attributeDescriptors = dataView.meta().attributeDescriptors();
    const attributeDescriptor = attributeDescriptors.find(
        (descriptor) => descriptor.attributeHeader.localIdentifier === localId,
    );
    return attributeDescriptor?.attributeHeader?.name;
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
