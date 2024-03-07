// (C) 2024 GoodData Corporation
import { GridApi, IDatasource, IGetRowsParams } from "@ag-grid-community/all-modules";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { dataViewToRepeaterData } from "./dataViewToRepeaterData.js";

const MAX_COLUMNS = 1000;

export type GridApiProvider = () => GridApi | undefined;

export class AgGridDatasource implements IDatasource {
    public rowCount: number | undefined;
    private dataViewFacade: DataViewFacade;

    constructor(dataViewFacade: DataViewFacade) {
        const [firstDimCount] = dataViewFacade.dataView.count;
        this.dataViewFacade = dataViewFacade;
        this.rowCount = firstDimCount;
    }

    private async loadExecutionWindow(startRow: number, endRow: number) {
        const hasTwoDim = this.dataViewFacade.meta().dimensions().length > 1;
        const offset = hasTwoDim ? [startRow, 0] : [startRow];
        const size = hasTwoDim ? [endRow - startRow, MAX_COLUMNS] : [endRow - startRow];
        return this.dataViewFacade.result().readWindow(offset, size);
    }

    public getRows = (params: IGetRowsParams): void => {
        const { startRow, endRow, successCallback, failCallback } = params;

        this.loadExecutionWindow(startRow, endRow)
            .then((result) => {
                const dataViewFacade = DataViewFacade.for(result);
                const transformedResult = dataViewToRepeaterData(dataViewFacade);
                successCallback(transformedResult, result.totalCount[0]);
            })
            .catch((error) => {
                console.error("error", { error });
                failCallback();
            });
    };
}
