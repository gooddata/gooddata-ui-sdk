// (C) 2019-2023 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { dataViewDimensionItems, dataViewHeaders, measureGroupItems } from "./utils.js";
import {
    attributeLocalId,
    IAttribute,
    IMeasure,
    measureLocalId,
    IMeasureDescriptor,
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
} from "@gooddata/sdk-model";
import keyBy from "lodash/keyBy.js";
//
//
//

export type DataSeriesDigest = {
    /**
     * Index of dimension that contains data series
     */
    dimIdx: number;

    /**
     * All measure descriptors in the series dimension.
     */
    fromMeasures: IMeasureDescriptor[];

    /**
     * Definitions of measures in the series dimension. The order of appearance matches
     * the order of appearance in the `fromMeasures` array.
     */
    fromMeasuresDef: IMeasure[];

    /**
     * All series-scoping attribute descriptors in series dimension.
     */
    scopingAttributes: IAttributeDescriptor[];

    /**
     * Definitions of scoping attributes in the series dimension. The order of appearance matches
     * the order of appearance in the `scopingAttributes`
     */
    scopingAttributesDef: IAttribute[];

    /**
     * All measure headers in the series dimension
     */
    measureHeaders: IResultMeasureHeader[];

    /**
     * All attribute headers in the series dimension - kept in order of their original appearance.
     */
    allAttributeHeaders: IResultAttributeHeader[][];

    /**
     * Index of measure local id → index into the series dimension
     */
    measureIndexes: { [localId: string]: number[] };

    /**
     * Count of data series - this is equal to number of measure headers (= all occurrences of all scoped measures)
     */
    count: number;
};

export type DataSlicesDigest = {
    /**
     * Index of dimension that contains data slices
     */
    dimIdx: number;

    /**
     * All attribute descriptors & totals definitions for the slices dimension.
     */
    descriptors: IAttributeDescriptor[];

    /**
     * Definitions of all attributes in the slices dimension. The order of appearance matches the
     * order of the descriptors.
     */
    descriptorsDef: IAttribute[];

    /**
     * All headers in the slices dimension.
     */
    headerItems: IResultHeader[][];

    /**
     * Total number of slices
     */
    count: number;
};

export type AttributeIndex = { [localId: string]: IAttribute };
export type MeasureIndex = { [localId: string]: IMeasure };

export type ExecutionDefinitionDigest = {
    /**
     * Attributes indexed by their local identifier
     */
    attributesIndex: AttributeIndex;

    /**
     * Measures indexed by their local identifier
     */
    measuresIndex: MeasureIndex;
};

/**
 * Data Access Digest contains categorized information and pointers to various parts of execution result
 * and the data view. The information from this digest is then used for more ergonomic creation of the
 * actual data series and slices and their descriptors.
 */
export type DataAccessDigest = {
    /**
     * Information about series. If series property is not in digest, then data view does not contain any
     * data series - which is completely valid case.
     */
    series?: DataSeriesDigest;

    /**
     * Information about slices. If slices property is not in digest, then data view does not contain any
     * data slices - which is completely valid case.
     */
    slices?: DataSlicesDigest;

    /**
     * Information extracted from execution definition.
     */
    def: ExecutionDefinitionDigest;
};

//
//
//

/**
 * @internal
 */
type ResultDescriptor = {
    /**
     * Indexes in data series and data slices dimensions (in this order). If the result does not
     * have series or slices, then the respective index is -1.
     */
    locations: [number, number];

    /**
     * Data series are in the dimension which contains measure group. If there are data series in the result,
     * then this property will contain the located measure group.
     */
    measureGroup?: IMeasureGroupDescriptor;
};

/**
 * Given data view dimensions, this function identifies dimensions where data series and
 * data slices are laid out. The returned result always contains two elements. First being
 * the index to data series dimension, second to data slices dimension. If series / slices
 * are not present, then the respective element contains -1.
 */
function findSlicesAndSeriesDims(dimensions: IDimensionDescriptor[]): ResultDescriptor {
    if (dimensions.length === 0) {
        return {
            locations: [-1, -1],
        };
    }

    /*
     * possible valid locations of series and slices. rows and cols OR cols and rows.
     */
    const possibleLocations: Array<[number, number]> = [
        [0, 1],
        [1, 0],
    ];

    for (const locations of possibleLocations) {
        const [seriesIdx, slicesIdx] = locations;

        const dimension = dimensions[seriesIdx];

        if (!dimension) {
            continue;
        }

        const measureGroup = dimension.headers.find(isMeasureGroupDescriptor);

        if (measureGroup) {
            if (!dimensions[slicesIdx]) {
                return {
                    locations: [seriesIdx, -1],
                    measureGroup,
                };
            }

            return {
                locations,
                measureGroup,
            };
        }
    }

    /*
     * The only possibility at this point is there are no data series.
     */
    return {
        locations: [-1, 0],
    };
}

function createMeasureIndexes(
    measureDescriptors: IMeasureDescriptor[],
    measureHeaders: IResultMeasureHeader[],
) {
    const measureAndIndex: Array<[string, number]> =
        measureHeaders?.filter(isResultMeasureHeader).map((m, idx) => {
            const measure = measureDescriptors[m.measureHeaderItem.order].measureHeaderItem.localIdentifier;

            return [measure, idx];
        }) ?? [];

    const accumulator: Record<string, number[]> = {};
    return measureAndIndex.reduce((res, [localId, seriesIdx]) => {
        if (!res[localId]) {
            res[localId] = [];
        }

        res[localId].push(seriesIdx);
        return res;
    }, accumulator);
}

function createDataSeriesDigest(
    dataView: IDataView,
    resultDesc: ResultDescriptor,
    def: ExecutionDefinitionDigest,
): DataSeriesDigest | undefined {
    const { measureGroup, locations } = resultDesc;

    if (!measureGroup) {
        return;
    }

    const dimIdx = locations[0];
    const headerItems = dataViewHeaders(dataView, dimIdx);
    const measureHeaders =
        headerItems.find((headers): headers is IResultMeasureHeader[] => isResultMeasureHeader(headers[0])) ??
        [];

    const allAttributeHeaders =
        headerItems.filter((headers): headers is IResultAttributeHeader[] =>
            isResultAttributeHeader(headers[0]),
        ) ?? [];
    const count = measureHeaders ? measureHeaders.length : 0;
    const fromMeasures = measureGroupItems(measureGroup);
    const fromMeasuresDef = fromMeasures.map((m) => def.measuresIndex[m.measureHeaderItem.localIdentifier]);
    const scopingAttributes = dataViewDimensionItems(dataView, dimIdx).filter(isAttributeDescriptor);
    const scopingAttributesDef: IAttribute[] = scopingAttributes.map(
        (a) => def.attributesIndex[a.attributeHeader.localIdentifier],
    );
    const measureIndexes = createMeasureIndexes(fromMeasures, measureHeaders);

    return {
        dimIdx,
        fromMeasures,
        fromMeasuresDef,
        scopingAttributes,
        scopingAttributesDef,
        measureHeaders,
        allAttributeHeaders,
        measureIndexes,
        count,
    };
}

function createDataSlicesDigest(
    dataView: IDataView,
    resultDesc: ResultDescriptor,
    def: ExecutionDefinitionDigest,
): DataSlicesDigest | undefined {
    const { locations } = resultDesc;
    const dimIdx = locations[1];

    if (dimIdx < 0) {
        return;
    }

    const headerItems = dataViewHeaders(dataView, dimIdx);
    const count = headerItems.length > 0 ? headerItems[0].length : 0;
    const descriptors = dataViewDimensionItems(dataView, dimIdx).filter(isAttributeDescriptor);
    const descriptorsDef = descriptors.map((d) => def.attributesIndex[d.attributeHeader.localIdentifier]);

    return {
        dimIdx,
        descriptors,
        descriptorsDef,
        headerItems,
        count,
    };
}

function createExecutionDefinitionDigest(dataView: IDataView): ExecutionDefinitionDigest {
    const { definition } = dataView;
    const attributesIndex: AttributeIndex = keyBy(definition.attributes, attributeLocalId);
    const measuresIndex: MeasureIndex = keyBy(definition.measures, measureLocalId);

    return {
        attributesIndex,
        measuresIndex,
    };
}

/**
 * Creates digest for the provided data view. The digest includes references to various parts of the
 * data view. The digest never copies any data from the input data view.
 *
 * @param dataView - data view to calculate digest for
 * @returns new digest
 */
export function createDataAccessDigest(dataView: IDataView): DataAccessDigest {
    const resultDesc = findSlicesAndSeriesDims(dataView.result.dimensions);
    const def = createExecutionDefinitionDigest(dataView);

    const series = createDataSeriesDigest(dataView, resultDesc, def);
    const slices = createDataSlicesDigest(dataView, resultDesc, def);

    return {
        series,
        slices,
        def,
    };
}
