// (C) 2024-2025 GoodData Corporation
import { GridApi, IDatasource, IGetRowsParams } from "ag-grid-community";

import { DataViewFacade } from "@gooddata/sdk-ui";

import { dataViewToRepeaterData } from "./dataViewToRepeaterData.js";
import { IRepeaterChartConfig } from "../publicTypes.js";

const MAX_COLUMNS = 1000;

export type GridApiProvider = () => GridApi | undefined;

export type AdGridCallbacks = {
    onError?: (error: any) => void;
};

export const getWindowSize = (numberOfDimensions: number, startRow = 0, endRow = 100) => {
    const hasTwoDim = numberOfDimensions === 2;
    const offset = hasTwoDim ? [startRow, 0] : [startRow];
    const size = hasTwoDim ? [endRow - startRow, MAX_COLUMNS] : [endRow - startRow];

    return { offset, size };
};

export class AgGridDatasource implements IDatasource {
    public rowCount: number | undefined;
    private dataViewFacade: DataViewFacade;
    private onError: AdGridCallbacks["onError"];
    private config: IRepeaterChartConfig;

    constructor(dataViewFacade: DataViewFacade, callbacks: AdGridCallbacks, config: IRepeaterChartConfig) {
        const [firstDimCount] = dataViewFacade.dataView.count;
        this.dataViewFacade = dataViewFacade;
        this.rowCount = firstDimCount;
        this.onError = callbacks.onError;
        this.config = config;
    }

    private async loadExecutionWindow(startRow: number, endRow: number) {
        const numberOfDimensions = this.dataViewFacade.meta().dimensions().length;
        const { offset, size } = getWindowSize(numberOfDimensions, startRow, endRow);
        return this.dataViewFacade.result().readWindow(offset, size);
    }

    public getRows = (params: IGetRowsParams): void => {
        const { startRow, endRow, successCallback, failCallback } = params;

        this.loadExecutionWindow(startRow, endRow)
            .then((result) => {
                const dataViewFacade = DataViewFacade.for(result);
                const transformedResult = dataViewToRepeaterData(dataViewFacade, this.config?.separators);
                successCallback(transformedResult, result.totalCount[0]);
            })
            .catch((error) => {
                console.error("error", { error });
                failCallback();
                this.onError?.(error);
            });
    };
}
