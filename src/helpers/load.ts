import get = require('lodash/get');
import cloneDeep = require('lodash/cloneDeep');
import { ISimpleExecutorResult } from 'gooddata';
import {
    AfmConverter,
    DataSource,
    ErrorCodes as DataErrorCodes,
    MetadataSource,
    VisualizationObject,
    Transformation,
    TransformationUtils
} from '@gooddata/data-layer';

import { ErrorCodes, ErrorStates } from '../constants/errorStates';

import { updateSorting, ISorting } from './metadata';

export interface IError {
    response: {
        status: number
    };
}

export interface IResult {
    result: ISimpleExecutorResult;
    metadata?: VisualizationObject.IVisualizationObject;
}

export interface ITableResult extends IResult {
    sorting: ISorting;
}

function handleExecutionError(reason: IError) {
    const status = reason.response && reason.response.status;
    switch (status) {
        case DataErrorCodes.HTTP_TOO_LARGE:
            return Promise.reject(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
        case DataErrorCodes.HTTP_BAD_REQUEST:
            return Promise.reject(ErrorStates.BAD_REQUEST);
        case ErrorCodes.APP_NO_DATA:
            return Promise.reject(ErrorStates.NO_DATA);
        case ErrorCodes.EMPTY_AFM:
            return Promise.reject(ErrorStates.EMPTY_AFM);
        case ErrorCodes.INVALID_BUCKETS:
            return Promise.reject(ErrorStates.INVALID_BUCKETS);
        default:
            return Promise.reject(ErrorStates.UNKNOWN_ERROR);
    }
}

function decorateMetrics(visObj: VisualizationObject.IVisualizationObject):
    VisualizationObject.IVisualizationObject {
    const updatedVisObj = cloneDeep(visObj);
    updatedVisObj.content.buckets.measures = updatedVisObj.content.buckets.measures.map((measure, index) => {
        measure.measure.generatedId = `m${index + 1}`;
        return measure;
    });

    return updatedVisObj;
}

function getChartData(
    dataSource: DataSource.IDataSource<ISimpleExecutorResult>,
    transformation: Transformation.ITransformation,
    metadata?: VisualizationObject.IVisualizationObject
): Promise<IResult>  {
    return dataSource.getData(transformation).then((result) => {
        if (result.isEmpty) {
            throw { response: { status: ErrorCodes.APP_NO_DATA } };
        }

        return {
            metadata,
            result
        };
    });
}

export function initChartDataLoading(
    dataSource: DataSource.IDataSource<ISimpleExecutorResult>,
    metadataSource: MetadataSource.IMetadataSource,
    externalTransformation: Transformation.ITransformation
): Promise<IResult> {
    if (metadataSource) {
        return metadataSource.getVisualizationMetadata().then(({ metadata, measuresMap }) => {
            const { transformation } = AfmConverter.toAFM(metadata.content, {}, measuresMap);
            // mix AFM transformation and user defined transformation
            const updatedTransformation = TransformationUtils.combineTransformations(
                transformation, externalTransformation
            );
            return getChartData(dataSource, updatedTransformation, metadata);
        }).catch(handleExecutionError);
    }

    return getChartData(dataSource, externalTransformation).catch(handleExecutionError);
}

function applySorting(
    transformation: Transformation.ITransformation = {},
    sortInfo?: ISorting
): Transformation.ITransformation {
    if (get(sortInfo, 'change')) { // apply user defined sorting on transformation
        return {
            ...transformation,
            sorting: [sortInfo.sorting]
        };
    }

    return transformation;
}

function getTableData(
    dataSource: DataSource.IDataSource<ISimpleExecutorResult>,
    transformation: Transformation.ITransformation,
    sorting: ISorting,
    metadata?: VisualizationObject.IVisualizationObject
) {
    return dataSource.getData(transformation).then((result) => {
        if (result.isEmpty) {
            throw { response: { status: ErrorCodes.APP_NO_DATA } };
        }

        return {
            result,
            sorting,
            metadata
        };
    });
}

function getMetadataObjectWithSortingApplied(
    metadata: VisualizationObject.IVisualizationObject,
    sorting?: ISorting
) {
    const decoratedMD = decorateMetrics(metadata);

    if (!get(sorting, 'change')) {
        return {
            metadata: decoratedMD,
            sorting
        };
    }

    const updated = updateSorting(decoratedMD, sorting);
    return {
        metadata: updated.updatedMetadata,
        sorting: updated.updatedSorting
    };
}

export function initTableDataLoading(
        dataSource: DataSource.IDataSource<ISimpleExecutorResult>,
        metadataSource?: MetadataSource.IMetadataSource,
        externalTransformation?: Transformation.ITransformation,
        userSorting?: ISorting
): Promise<ITableResult> {
    if (!metadataSource) {
        const updatedTransformation = applySorting(externalTransformation, userSorting);
        const updatedSorting =
            get<Transformation.ITransformation, Transformation.ISort>(updatedTransformation, 'sorting[0]');

        return getTableData(dataSource, updatedTransformation, { sorting: updatedSorting, change: null })
            .catch(handleExecutionError);
    }

    return metadataSource.getVisualizationMetadata()
        .then(({ metadata: originalMetadata, measuresMap }) => {
            const { sorting, metadata } =
                getMetadataObjectWithSortingApplied(originalMetadata, userSorting);

            const { transformation } =
                AfmConverter.toAFM(metadata.content, {}, measuresMap);

            return {
                sorting,
                metadata,
                transformation
            };
        })
        .then(({ metadata, sorting, transformation }) => {
            // mix AFM transformation and user defined transformation
            const updatedTransformation =
                TransformationUtils.combineTransformations(transformation,
                    applySorting(externalTransformation, sorting));

            // no user selected sorting, use one from transformation
            if (!get(sorting, 'change')) {
                sorting = {
                    sorting:
                        get<Transformation.ITransformation, Transformation.ISort>(updatedTransformation, 'sorting[0]'),
                    change: null
                };
            }

            return getTableData(dataSource, updatedTransformation, sorting, metadata);
        })
        .catch(handleExecutionError);
}
