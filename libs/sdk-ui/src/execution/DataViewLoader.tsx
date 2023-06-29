// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import { IAttribute, IAttributeOrMeasure, INullableFilter, ISortItem, ITotal } from "@gooddata/sdk-model";
import { IAnalyticalBackend, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { createExecution } from "./createExecution.js";
import { DataViewWindow } from "./withExecutionLoading.js";
import { DataViewFacade } from "../base/index.js";

/**
 * {@link DataViewLoader} options
 *
 * @internal
 */
interface IDataViewLoaderOptions {
    readonly seriesBy?: IAttributeOrMeasure[];
    readonly slicesBy?: IAttribute[];
    readonly totals?: ITotal[];
    readonly filters?: INullableFilter[];
    readonly sortBy?: ISortItem[];
    readonly componentName?: string;
    readonly offset?: number[];
    readonly size?: number[];
}

/**
 * DataViewLoader allows you to speficy, load and access data results with convenient series and slices API.
 *
 * @alpha
 */
export class DataViewLoader {
    private constructor(
        private readonly backend: IAnalyticalBackend,
        private readonly workspace: string,
        private readonly options: IDataViewLoaderOptions = {},
    ) {}

    /**
     * Creates a new instance of the DataViewLoader for particular backend and workspace.
     *
     * @alpha
     */
    public static for(backend: IAnalyticalBackend, workspace: string): DataViewLoader {
        return new DataViewLoader(backend, workspace);
    }

    /**
     * Data series will be built using the provided measures that are further scoped for
     * elements of the specified attributes.
     *
     * @remarks
     * You must define at least 1 measure for the series.
     *
     * @alpha
     */
    public seriesFrom = (...measuresAndScopingAttributes: IAttributeOrMeasure[]): DataViewLoader => {
        return this.newLoaderWithOptions({ seriesBy: measuresAndScopingAttributes });
    };

    /**
     * Slice all data series by elements of these attributes.
     *
     * @alpha
     */
    public slicesFrom = (...attributes: IAttribute[]): DataViewLoader => {
        return this.newLoaderWithOptions({ slicesBy: attributes });
    };

    /**
     * Filters to apply on server side.
     *
     * @alpha
     */
    public filterBy = (...filters: INullableFilter[]): DataViewLoader => {
        return this.newLoaderWithOptions({ filters });
    };

    /**
     * Sorting to apply on server side.
     *
     * @alpha
     */
    public sortBy = (...sorts: ISortItem[]): DataViewLoader => {
        return this.newLoaderWithOptions({ sortBy: sorts });
    };

    /**
     * Include these totals among the data slices.
     *
     * @alpha
     */
    public withTotals = (...totals: ITotal[]): DataViewLoader => {
        return this.newLoaderWithOptions({ totals });
    };

    /**
     * Loads subset of the result data and wraps them in {@link DataViewFacade}.
     *
     * @alpha
     */
    public loadWindow = async (dataWindow: DataViewWindow): Promise<DataViewFacade> => {
        const result = await this.loadResult();
        const dataView = await result.readWindow(dataWindow.offset, dataWindow.size);
        return DataViewFacade.for(dataView);
    };

    /**
     * Loads all the result data and wraps them in {@link DataViewFacade}.
     *
     * @alpha
     */
    public loadAll = async (): Promise<DataViewFacade> => {
        const result = await this.loadResult();
        const dataView = await result.readAll();
        return DataViewFacade.for(dataView);
    };

    private loadResult = async (): Promise<IExecutionResult> => {
        invariant(this.options.seriesBy, "You need to specify series before loading the results.");

        const execution = createExecution({
            backend: this.backend,
            workspace: this.workspace,
            seriesBy: this.options.seriesBy,
            componentName: "DataViewLoader",
            ...this.options,
        });

        return execution.execute();
    };

    private newLoaderWithOptions = (options: IDataViewLoaderOptions): DataViewLoader => {
        return new DataViewLoader(this.backend, this.workspace, { ...this.options, ...options });
    };
}
