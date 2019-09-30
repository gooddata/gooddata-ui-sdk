// (C) 2019 GoodData Corporation

import { AttributeOrMeasure, IAttribute, IFilter, ITotal, SortItem } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IPivotTableConfig } from "./PivotTable";
import { IVisualizationCallbacks, IVisualizationProps } from "../base/interfaces/VisualizationProps";

export interface IPivotTableBucketProps {
    measures?: AttributeOrMeasure[];
    rows?: IAttribute[];
    columns?: IAttribute[];
    totals?: ITotal[];
    filters?: IFilter[];
    sortBy?: SortItem[];
}

export interface IPivotTableProps extends ICorePivotTableProps, IPivotTableBucketProps {
    backend: IAnalyticalBackend;
    workspace: string;
}

export interface ICorePivotTableProps extends IVisualizationProps, IVisualizationCallbacks {
    pageSize?: number;
    config?: IPivotTableConfig;
    groupRows?: boolean;
    exportTitle?: string;
}
