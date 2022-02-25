// (C) 2007-2022 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDashboardReferences,
    IDashboardWithReferences,
    IDataView,
    IElementsQueryOptions,
    IExecutionResult,
    IMetadataObject,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IMeasure, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
/**
 * Defines callbacks for events that are emitted by with eventing backend decorator.
 *
 * @beta
 */
export type AnalyticalBackendCallbacks = {
    /**
     * Called before prepared execution's execute() is called.
     *
     * @param def - definition that will be used for the execution
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    beforeExecute?: (def: IExecutionDefinition, executionId: string) => void;

    /**
     * Called when the execute successfully completes.
     *
     * @param result - execution result (mind that this contains definition already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulExecute?: (result: IExecutionResult, executionId: string) => void;

    /**
     * Called when the execute ends with an error.
     *
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedExecute?: (error: any, executionId: string) => void;

    /**
     * Called when IExecuteResult.readAll() successfully completes.
     *
     * @param dataView - data view (mind that this contains definition and result already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulResultReadAll?: (dataView: IDataView, executionId: string) => void;

    /**
     * Called when IExecuteResult.readAll() ends with an error.
     *
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedResultReadAll?: (error: any, executionId: string) => void;

    /**
     * Called when IExecuteResult.readWindow() successfully completes. The function is called with the requested
     * window arguments and the resulting data size (note: requested window & actual window may differ)
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param dataView - data view (mind that this contains definition and result already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulResultReadWindow?: (
        offset: number[],
        size: number[],
        dataView: IDataView,
        executionId: string,
    ) => void;

    /**
     * Called when IExecuteResult.readWindow() ends with an error. The function is called with the requested
     * window arguments and the error from the underlying backend.
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedResultReadWindow?: (offset: number[], size: number[], error: any, executionId: string) => void;

    dashboards?: {
        dashboardWithReferencesSuccess?: (dashboardWithReferenes: IDashboardWithReferences) => void;
        dashboardWithReferencedObjectsSuccess?: (dashboardReferences: IDashboardReferences) => void;
    };
    attributes?: {
        attributeDisplayFormSuccess?: (attributeDisplayForm: IAttributeDisplayFormMetadataObject) => void;
        attributeDisplayFormsSuccess?: (attributeDisplayForms: IAttributeDisplayFormMetadataObject[]) => void;
        attributeSuccess?: (attributeDisplayForm: IAttributeMetadataObject) => void;
        attributesSuccess?: (attributeDisplayForm: IAttributeMetadataObject[]) => void;
        commonAttributesSuccess?: (attributeRefs: ObjRef[]) => void;
        commonAttributesBatchSuccess?: (attributeRefs: ObjRef[][]) => void;
        attributeDatasetMetaSuccess?: (dataSet: IMetadataObject) => void;
    };
    elements?: {
        displayFormElementsQuery?: (options: {
            ref: ObjRef;
            offset?: number;
            limit?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        }) => void;
        displayFormElementsQueryPage?: (options: {
            ref: ObjRef;
            offset?: number;
            limit?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        }) => void;
    };
};
