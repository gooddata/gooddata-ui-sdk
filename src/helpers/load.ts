import { get, cloneDeep } from 'lodash';
import {
    AfmConverter,
    DataSource,
    ExecutorResult,
    MetadataSource,
    Transformation,
    VisualizationObject
} from '@gooddata/data-layer';

import { ErrorStates, ErrorCodes } from '../constants/errorStates';

export interface IError {
    response: {
        status: number
    };
}

export interface IResult {
    result: ExecutorResult.ISimpleExecutorResult;
    metadata: VisualizationObject.IVisualizationObjectMetadata;
}

export interface ITableResult extends IResult {
    sorting: Transformation.ISort;
}

function handleExecutionError(reason: IError) {
    const status = reason.response && reason.response.status;
    switch (status) {
        case ErrorCodes.HTTP_TOO_LARGE:
            return Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
        case ErrorCodes.HTTP_BAD_REQUEST:
            return Promise.reject(ErrorStates.BAD_REQUEST);
        case ErrorCodes.APP_NO_DATA:
            return Promise.reject(ErrorStates.NO_DATA);
        default:
            return Promise.reject(ErrorStates.UNKNOWN_ERROR);
    }
}

function decorateMetrics(visObj: VisualizationObject.IVisualizationObject):
    VisualizationObject.IVisualizationObject {
    const updatedVisObj = cloneDeep(visObj);
    updatedVisObj.buckets.measures = updatedVisObj.buckets.measures.map((measure, index) => {
        measure.measure.generatedId = `m${index + 1}`;
        return measure;
    });

    return updatedVisObj;
}

function getTransformation(
        metadata: VisualizationObject.IVisualizationObjectMetadata,
        sorting: Transformation.ISort,
        measuresMap: VisualizationObject.IMeasuresMap): Transformation.ITransformation {
    const decoratedMD = decorateMetrics(metadata.content);
    const { transformation } = AfmConverter.toAFM(decoratedMD, {}, measuresMap);
    return { ...transformation, sorting: [sorting] };
}

export function initChartDataLoading(metadataSource: MetadataSource.IMetadataSource,
    dataSource: DataSource.IDataSource, deps = { toAFM: AfmConverter.toAFM }): Promise<IResult> {
    return metadataSource.getVisualizationMetadata().then(({ metadata, measuresMap }) => {
        const { transformation } = deps.toAFM(metadata.content, {}, measuresMap) as AfmConverter.IConvertedAFM;

        return dataSource.getData(transformation).then((result) => {
            if (result.isEmpty) {
                throw { response: { status: ErrorCodes.APP_NO_DATA } };
            }
            return {
                metadata,
                result
            };
        });
    }).catch(handleExecutionError);
}

export interface IConfig {
    metadata: any;
    sorting: any;
}

export function initTableDataLoading(
        metadataSource: MetadataSource.IMetadataSource,
        dataSource: DataSource.IDataSource,
        currentConfig: IConfig): Promise<ITableResult> {
    return metadataSource.getVisualizationMetadata().then(({ metadata, measuresMap }) => {
        const currentMetadata = currentConfig ? currentConfig.metadata : metadata;
        const decoratedMD = decorateMetrics(currentMetadata.content);
        const { transformation } = AfmConverter.toAFM(decoratedMD, {}, measuresMap);
        const currentSorting = currentConfig ? currentConfig.sorting : get(transformation, 'sorting[0]');
        const finalTransformation = getTransformation(currentMetadata, currentSorting, measuresMap);
        currentMetadata.content = decoratedMD;
        return dataSource.getData(finalTransformation).then((result) => {
            if (result.isEmpty) {
                throw { response: { status: ErrorCodes.APP_NO_DATA } };
            }
            return {
                result,
                metadata: currentMetadata,
                sorting: currentSorting
            };
        });
    }).catch(handleExecutionError);
}
