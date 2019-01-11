// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';
import * as invariant from 'invariant';
import { IUnwrappedAttributeHeadersWithItems } from '../components/visualizations/chart/chartOptionsBuilder';
import { IMappingHeader } from '../interfaces/MappingHeader';
import { getMappingHeaderLocalIdentifier } from './mappingHeader';

export function findInDimensionHeaders(dimensions: Execution.IResultDimension[], headerCallback: Function): any {
    let returnValue: any = null;
    dimensions.some((dimension: any, dimensionIndex: number) => {
        dimension.headers.some(
            (wrappedHeader: Execution.IMeasureGroupHeader | Execution.IAttributeHeader, headerIndex: number) => {
                const headerType = Object.keys(wrappedHeader)[0];
                const header = wrappedHeader[headerType];
                const headerCount = dimension.headers.length;
                returnValue = headerCallback(headerType, header, dimensionIndex, headerIndex, headerCount);
                return !!returnValue;
            }
        );
        return !!returnValue;
    });
    return returnValue;
}

export function findMeasureGroupInDimensions(
    dimensions: Execution.IResultDimension[]
): Execution.IMeasureGroupHeader['measureGroupHeader'] {
    return findInDimensionHeaders(dimensions,
        (headerType: string, header: Execution.IMeasureGroupHeader['measureGroupHeader'],
         _dimensionIndex: number, headerIndex: number, headerCount: number) => {
            const measureGroupHeader = headerType === 'measureGroupHeader' ? header : null;
            if (measureGroupHeader) {
                invariant(headerIndex === headerCount - 1, 'MeasureGroup must be the last header in it\'s dimension');
            }
            return measureGroupHeader;
        });
}

export function findAttributeInDimension(
    dimension: any,
    attributeHeaderItemsDimension: any,
    indexInDimension?: number
): IUnwrappedAttributeHeadersWithItems {
    return findInDimensionHeaders(
        [dimension], (
            headerType: string,
            header: Execution.IAttributeHeader['attributeHeader'],
            _dimensionIndex: number,
            headerIndex: number
        ) => {
            if (headerType === 'attributeHeader'
                && (indexInDimension === undefined || indexInDimension === headerIndex)) {
                return {
                    ...header,
                    // attribute items are delivered separately from attributeHeaderItems
                    items: attributeHeaderItemsDimension[indexInDimension ? indexInDimension : 0]
                };
            }
            return null;
        });
}

export function findMeasureHeaderByLocalIdentifier(
    executionResponse: Execution.IExecutionResponse,
    localIdentifier: string
): IMappingHeader {
    const responseMeasureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);
    if (!responseMeasureGroup) {
        return null;
    }
    const header = responseMeasureGroup.items.find(
        header => getMappingHeaderLocalIdentifier(header) === localIdentifier
    );
    return header ? header : null;
}
