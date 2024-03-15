// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import { BucketNames, DataViewFacade, LoadingComponent, emptyHeaderTitleFromIntl } from "@gooddata/sdk-ui";
import { AgGridDatasource } from "./repeaterAgGridDataSource.js";
import { attributeLocalId, bucketsFind, isMeasure, measureLocalId } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";
import { IChartConfig } from "../../../interfaces/index.js";
import { Icon } from "@gooddata/sdk-ui-kit";

interface IRepeaterChartProps {
    dataView: DataViewFacade;
    config?: IChartConfig;
    onError?: (error: any) => void;
}

const DEFAULT_COL_DEF = { resizable: true };

export const RepeaterChart: React.FC<IRepeaterChartProps> = ({ dataView, onError, config }) => {
    const intl = useIntl();
    const dataSource = useMemo(
        () => new AgGridDatasource(dataView, { onError }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dataView.fingerprint(), onError],
    );

    const columnDefs = useMemo(() => {
        const attributeDescriptors = dataView.meta().attributeDescriptors();
        const measureDescriptors = dataView.meta().measureDescriptors();
        const columnsBucket = bucketsFind(dataView.definition.buckets, BucketNames.COLUMNS);

        return columnsBucket.items.map((bucketItem) => {
            if (isMeasure(bucketItem)) {
                const localId = measureLocalId(bucketItem);
                const measureDescriptor = measureDescriptors.find(
                    (descriptor) => descriptor.measureHeaderItem.localIdentifier === localId,
                );

                return {
                    headerName: measureDescriptor.measureHeaderItem.name,
                    field: localId,
                    cellClass: "gd-cell",
                    cellRenderer: function CellRenderer(props) {
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
                                    height={26}
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
                    cellRenderer: function CellRenderer(props) {
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
                                    height={26}
                                    speed={2}
                                />
                            );
                        }

                        const isHyperlink = attributeDescriptor.attributeHeader.labelType === "GDC.link";
                        const isImage = attributeDescriptor.attributeHeader.labelType === "GDC.image";
                        const hyperlinkStaticText = hyperlinkDisplayFormConfig?.staticElementsText;

                        let renderValue: React.ReactNode = value || emptyHeaderTitleFromIntl(intl);
                        if (isHyperlink) {
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
                            renderValue = value ? (
                                <img className="gd-repeater-image" src={value} alt={value} />
                            ) : (
                                <div className="gd-repeater-image-empty">
                                    <Icon.Image />
                                </div>
                            );
                        }

                        return <div className="gd-repeater-cell-wrapper">{renderValue}</div>;
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
                defaultColDef={DEFAULT_COL_DEF}
                modules={AllCommunityModules}
                columnDefs={columnDefs}
                rowClass="gd-table-row"
                datasource={dataSource}
                rowModelType="infinite"
            />
        </div>
    );
};
