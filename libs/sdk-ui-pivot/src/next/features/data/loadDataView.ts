// (C) 2025 GoodData Corporation
import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { COLUMNS_PER_PAGE } from "../../constants/internal.js";

/**
 * @internal
 */
export interface ILoadDataViewParams {
    executionResult: IExecutionResult;
    startRow: number;
    endRow: number;
}

/**
 * Loads specified rows and wraps them into {@link DataViewFacade} for the provided {@link IExecutionResult}.
 *
 * @internal
 */
export async function loadDataView({
    executionResult,
    startRow,
    endRow,
}: ILoadDataViewParams): Promise<DataViewFacade> {
    const result = await executionResult.readWindow([startRow, 0], [endRow - startRow, COLUMNS_PER_PAGE]);

    return DataViewFacade.for(result);
}
