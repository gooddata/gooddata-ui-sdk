// (C) 2024 GoodData Corporation

import React, { useMemo, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules, ColDef, ICellRendererParams } from "@ag-grid-community/all-modules";
import { BucketNames, DataViewFacade, LoadingComponent, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";
import { AgGridDatasource } from "./repeaterAgGridDataSource.js";
import { attributeLocalId, bucketsFind, isMeasure, measureLocalId } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";
import { IChartConfig, ChartRowHeight } from "../../../interfaces/index.js";
import { Icon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import stringify from "json-stable-stringify";

interface IRepeaterChartProps {
    dataView: DataViewFacade;
    config?: IChartConfig;
    onError?: (error: any) => void;
}

const SMALL_ROW_HEIGHT = 25;
const MEDIUM_ROW_HEIGHT = 55;
const LARGE_ROW_HEIGHT = 85;

const DEFAULT_COL_DEF = { resizable: true };

function getRowHeight(rowHeight?: ChartRowHeight) {
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

export const RepeaterChart: React.FC<IRepeaterChartProps> = ({ dataView, onError, config }) => {
    const intl = useIntl();
    const dataSource = useMemo(
        () => new AgGridDatasource(dataView, { onError }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dataView.fingerprint(), onError],
    );

    const rowHeight = getRowHeight(config?.rowHeight);
    const verticalAlign = config?.cellVerticalAlign ?? "top";
    const textWrapping = config?.cellTextWrapping ?? "clip";
    const imageSizing = config?.cellImageSizing ?? "fit";

    const cellWrapperClassName = cx(
        "gd-repeater-cell-wrapper",
        `gd-vertical-align-${verticalAlign}`,
        `gd-text-wrapping-${textWrapping}`,
        `gd-image-sizing-${imageSizing}`,
    );

    const columnDefs = useMemo(() => {
        const attributeDescriptors = dataView.meta().attributeDescriptors();
        const measureDescriptors = dataView.meta().measureDescriptors();
        const columnsBucket = bucketsFind(dataView.definition.buckets, BucketNames.COLUMNS);

        return columnsBucket.items.map((bucketItem): ColDef => {
            if (isMeasure(bucketItem)) {
                const localId = measureLocalId(bucketItem);
                const measureDescriptor = measureDescriptors.find(
                    (descriptor) => descriptor.measureHeaderItem.localIdentifier === localId,
                );

                return {
                    headerName: measureDescriptor.measureHeaderItem.name,
                    field: localId,
                    cellClass: "gd-cell",
                    cellRenderer: function CellRenderer(props: ICellRendererParams) {
                        const theme = useTheme();
                        const color =
                            theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;
                        const { value, node } = props;
                        const loadingDone = node.id !== undefined;
                        if (!loadingDone) {
                            return (
                                <LoadingComponent
                                    color={color}
                                    width={36}
                                    imageHeight={8}
                                    height={rowHeight}
                                    speed={2}
                                />
                            );
                        }
                        return <div>{JSON.stringify(value) || "–"}</div>;
                    },
                    valueGetter: (params: any) => {
                        return params.data?.[localId];
                    },
                };
            } else {
                const localId = attributeLocalId(bucketItem);
                const attributeDescriptor = attributeDescriptors.find(
                    (descriptor) => descriptor.attributeHeader.localIdentifier === localId,
                );

                return {
                    headerName: attributeDescriptor.attributeHeader.name,
                    field: localId,
                    cellClass: "gd-cell",
                    cellRenderer: function CellRenderer(props: ICellRendererParams) {
                        const hyperlinkDisplayFormConfig = config?.hyperLinks?.[localId];
                        const theme = useTheme();
                        const color =
                            theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;
                        const { value, node } = props;
                        const loadingDone = node.id !== undefined;
                        if (!loadingDone) {
                            return (
                                <LoadingComponent
                                    color={color}
                                    width={36}
                                    imageHeight={8}
                                    height={rowHeight}
                                    speed={2}
                                />
                            );
                        }

                        const isHyperlink = attributeDescriptor.attributeHeader.labelType === "GDC.link";
                        const isImage = attributeDescriptor.attributeHeader.labelType === "GDC.image";
                        const isPlainText =
                            typeof attributeDescriptor.attributeHeader.labelType === "undefined";
                        const hyperlinkStaticText = hyperlinkDisplayFormConfig?.staticElementsText;

                        let renderValue: React.ReactNode = value || emptyHeaderTitleFromIntl(intl);
                        if (isPlainText) {
                            renderValue = <span>{renderValue}</span>;
                        } else if (isHyperlink) {
                            renderValue = value ? (
                                <a
                                    className="gd-repeater-link"
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {hyperlinkStaticText ? hyperlinkStaticText : value}
                                </a>
                            ) : (
                                emptyHeaderTitleFromIntl(intl)
                            );
                        } else if (isImage) {
                            renderValue = <RepeaterImage src={value} />;
                        }

                        return <div className={cellWrapperClassName}>{renderValue}</div>;
                    },
                    valueGetter: (params: any) => {
                        return params.data?.[localId]?.name;
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
