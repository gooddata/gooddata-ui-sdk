// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import { BucketNames, DataViewFacade, LoadingComponent } from "@gooddata/sdk-ui";
import { AgGridDatasource } from "./repeaterAgGridDataSource.js";
import { attributeLocalId, bucketsFind, isMeasure, measureLocalId } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

interface IRepeaterChartProps {
    dataView: DataViewFacade;
    onError?: (error: any) => void;
}

export const RepeaterChart: React.FC<IRepeaterChartProps> = ({ dataView, onError }) => {
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
                        const { value } = props;
                        if (!value) {
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
                        return <div>{JSON.stringify(value)}</div>;
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
                        const theme = useTheme();
                        const color =
                            theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;
                        const { value } = props;
                        if (!value) {
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
                        return <div>{value}</div>;
                    },
                    valueGetter: (params: any) => {
                        return params.data?.[localId]?.name;
                    },
                };
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataView.fingerprint()]);

    return (
        <div className="gd-repeater ag-theme-balham s-repeater">
            <AgGridReact
                key={dataView.fingerprint()}
                modules={AllCommunityModules}
                columnDefs={columnDefs}
                rowClass="gd-table-row"
                datasource={dataSource}
                rowModelType="infinite"
            />
        </div>
    );
};
