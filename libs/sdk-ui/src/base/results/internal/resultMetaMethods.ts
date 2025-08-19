// (C) 2019-2025 GoodData Corporation
import findIndex from "lodash/findIndex.js";
import flatMap from "lodash/flatMap.js";

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    IAttributeDescriptor,
    IAttributeLocatorItem,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasure,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IMeasureSortItem,
    IResultAttributeHeader,
    IResultHeader,
    ISortItem,
    attributeLocatorElement,
    attributeLocatorIdentifier,
    idMatchMeasure,
    isAttributeDescriptor,
    isAttributeLocator,
    isAttributeSort,
    isMeasureGroupDescriptor,
    isMeasureLocator,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isResultAttributeHeader,
    isVirtualArithmeticMeasure,
    sortMeasureLocators,
} from "@gooddata/sdk-model";

/**
 * Methods to access result metadata - dimension descriptors and result headers.
 *
 * @internal
 */
export interface IResultMetaMethods {
    /**
     * @returns data view's dimension descriptors
     * @remarks see {@link @gooddata/sdk-backend-spi#IDimensionDescriptor} for more information of what this is
     */
    dimensions(): IDimensionDescriptor[];

    /**
     * @param dimIdx - index of dimension
     * @returns dimension item descriptors for desired dimension of the resulting data view
     */
    dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[];

    /**
     * @returns attribute descriptors from all dimensions
     */
    attributeDescriptors(): IAttributeDescriptor[];

    /**
     * Returns attribute descriptors from particular dimension.
     *
     * @param dim - dimension index
     * @returns attribute descriptors, empty if none or if no such dimension
     */
    attributeDescriptorsForDim(dim: number): IAttributeDescriptor[];

    /**
     * @returns measure group descriptor, regardless of dimension in which it is located
     */
    measureGroupDescriptor(): IMeasureGroupDescriptor | undefined;

    /**
     * This is a convenience function to find measure group descriptor and return its measure descriptors.
     *
     * @returns measure descriptors, empty array if measure group header descriptor is not in any dimension
     */
    measureDescriptors(): IMeasureDescriptor[];

    /**
     * Finds measure descriptor by local identifier of the measure from execution definition.
     *
     * @param localId - local identifier of desired measure's descriptor
     * @returns undefined if no measure group header descriptor or no measure descriptor with the provided local identifier
     */
    measureDescriptor(localId: string): IMeasureDescriptor | undefined;

    /**
     * Tests whether there are any headers in the dimension with the provided index.
     *
     * @param dim - dimension index.
     */
    hasNoHeadersInDim(dim: number): boolean;

    /**
     * @returns all headers describing the data included in the data view
     */
    allHeaders(): IResultHeader[][][];

    /**
     * @returns filters headers for all dimensions so that only attribute headers for the dimensions
     *   are returned
     */
    attributeHeaders(): IResultAttributeHeader[][][];

    /**
     * @returns filters headers for the provided dimension so that only attribute headers in that dimension
     *   are returned
     */
    attributeHeadersForDim(idx: number): IResultAttributeHeader[][];

    /**
     * Tests whether measure descriptor is for a derived measure - that is, the measure is specified in
     * execution definition and is either PoP measure or Previous Period Measure.
     *
     * @param measureDescriptor - input measure descriptor
     * @returns true if measure for the provide measure descriptor is in definition AND is either PoP or previous
     *  period; false otherwise.
     */
    isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean;

    /**
     * Tests whether measure descriptor is for a virtual measure - that is, the measure is specified in
     * execution definition and is either virtual measure.
     *
     * @param measureDescriptor - input measure descriptor
     * @returns true if measure for the provide measure descriptor is in definition AND is either virtual measure; false otherwise.
     */
    isVirtualMeasure(measureDescriptor: IMeasureDescriptor): boolean;

    /**
     * Returns only those sort items from the result's definition which are actually applied on the result.
     *
     * The execution definition may contain sorts for measures scoped for particular attribute elements - it may
     * however happen that at the same time the execution definition contains filters that will remove the
     * attribute elements in question.
     *
     * This method inspects sorts in the definition, metadata and headers in the results and returns only those items
     * which actually match them.
     */
    effectiveSortItems(): ISortItem[];
}

//
//
//

type MeasureGroupHeaderIndex = {
    [id: string]: IMeasureDescriptor;
};

type MeasureGroupHeaderWithIdx = {
    dimIdx?: number;
    measureGroup?: IMeasureGroupDescriptor;
};

function findMeasureGroupHeader(dataView: IDataView): MeasureGroupHeaderWithIdx {
    for (let dimIdx = 0; dimIdx < dataView.result.dimensions.length; dimIdx++) {
        const dim = dataView.result.dimensions[dimIdx];
        const measureGroup = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroup) {
            return {
                dimIdx,
                measureGroup,
            };
        }
    }

    return {};
}

function buildMeasureHeaderIndex(measureGroup: IMeasureGroupDescriptor | undefined): MeasureGroupHeaderIndex {
    const items = measureGroup?.measureGroupHeader?.items ?? [];

    return items.reduce((acc: MeasureGroupHeaderIndex, val) => {
        const id = val.measureHeaderItem.localIdentifier;
        acc[id] = val;

        return acc;
    }, {});
}

class ResultMetaMethods implements IResultMetaMethods {
    /*
     * Derived property; index of dimension that contains measure group; undefined if no measure group
     */
    private readonly _measureGroupHeaderIdx: number | undefined;

    /*
     * Derived property; measure group header found in dimensions
     */
    private readonly _measureGroupHeader: IMeasureGroupDescriptor | undefined;
    /*
     * Derived property; measure local id => measure group header item
     */
    private readonly _measureDescriptorByLocalId: MeasureGroupHeaderIndex;

    constructor(private readonly dataView: IDataView) {
        const { dimIdx, measureGroup } = findMeasureGroupHeader(dataView);

        this._measureGroupHeaderIdx = dimIdx;
        this._measureGroupHeader = measureGroup;
        this._measureDescriptorByLocalId = buildMeasureHeaderIndex(this._measureGroupHeader);
    }

    public dimensions(): IDimensionDescriptor[] {
        return this.dataView.result.dimensions;
    }

    public dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[] {
        const dim = this.dataView.result.dimensions[dimIdx];

        return dim?.headers ? dim.headers : [];
    }

    public attributeDescriptors(): IAttributeDescriptor[] {
        return flatMap(this.dataView.result.dimensions, (dim) => {
            return dim.headers.filter(isAttributeDescriptor);
        });
    }

    public attributeDescriptorsForDim(dim: number): IAttributeDescriptor[] {
        return (this.dataView.result.dimensions[dim]?.headers ?? []).filter(isAttributeDescriptor);
    }

    public measureGroupDescriptor(): IMeasureGroupDescriptor | undefined {
        return this._measureGroupHeader;
    }

    public measureDescriptors(): IMeasureDescriptor[] {
        const header = this.measureGroupDescriptor();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureDescriptor(localId: string): IMeasureDescriptor | undefined {
        return this._measureDescriptorByLocalId[localId];
    }

    public hasNoHeadersInDim(dim: number): boolean {
        return this.dataView.headerItems[dim] && this.dataView.headerItems[dim].length === 0;
    }

    public allHeaders(): IResultHeader[][][] {
        const data = this.dataView.forecast();
        return this.dataView.headerItems.map((dimension: IResultHeader[][], dim) => {
            const forecastHeaders = (data.headerItems[dim]?.filter((headerList) =>
                isResultAttributeHeader(headerList[0]),
            ) ?? []) as IResultAttributeHeader[][];
            return dimension.map((normalHeader, idx) => {
                return [...normalHeader, ...(forecastHeaders[idx] ?? [])];
            }) as IResultHeader[][];
        });
    }

    public attributeHeaders(): IResultAttributeHeader[][][] {
        const data = this.dataView.forecast();
        return this.dataView.headerItems.map((dimension: IResultHeader[][], dim) => {
            const normalHeaders = dimension.filter((headerList) =>
                isResultAttributeHeader(headerList[0]),
            ) as IResultAttributeHeader[][];

            const forecastHeaders = (data.headerItems[dim]?.filter((headerList) =>
                isResultAttributeHeader(headerList[0]),
            ) ?? []) as IResultAttributeHeader[][];

            return normalHeaders.map((normalHeader, idx) => {
                return [...normalHeader, ...(forecastHeaders[idx] ?? [])];
            }) as IResultAttributeHeader[][];
        });
    }

    public attributeHeadersForDim(dim: number): IResultAttributeHeader[][] {
        if (this.hasNoHeadersInDim(dim)) {
            return [];
        }

        const data = this.dataView.forecast();
        const normalHeaders = this.dataView.headerItems[dim].filter((headerList) =>
            isResultAttributeHeader(headerList[0]),
        ) as IResultAttributeHeader[][];

        const forecastHeaders = (data.headerItems[dim]?.filter((headerList) =>
            isResultAttributeHeader(headerList[0]),
        ) ?? []) as IResultAttributeHeader[][];

        return normalHeaders.map((normalHeader, idx) => {
            return [...normalHeader, ...(forecastHeaders[idx] ?? [])];
        }) as IResultAttributeHeader[][];
    }

    public isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean {
        const measureIdMatch = idMatchMeasure(measureDescriptor.measureHeaderItem.localIdentifier);

        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (!measureIdMatch(measure)) {
                return false;
            }

            return isPoPMeasure(measure) || isPreviousPeriodMeasure(measure);
        });
    }

    public isVirtualMeasure(measureDescriptor: IMeasureDescriptor): boolean {
        const measureIdMatch = idMatchMeasure(measureDescriptor.measureHeaderItem.localIdentifier);
        const measure = this.dataView.definition.measures.find(measureIdMatch);
        return isVirtualArithmeticMeasure(measure);
    }

    /**
     * Matches attribute locator against the descriptors and headers in the data view. The attribute is expected
     * to be located in the same dimension as the measure group. The element specified in the locator must be
     * found within the respective attribute's headers.
     *
     * @param locator - locator to match
     */
    private matchAttributeLocator = (locator: IAttributeLocatorItem): boolean => {
        if (this._measureGroupHeaderIdx === undefined) {
            return false;
        }

        const attributeId = attributeLocatorIdentifier(locator);
        const attributeIdx = findIndex(
            this.dimensionItemDescriptors(this._measureGroupHeaderIdx),
            (descriptor) => {
                return (
                    isAttributeDescriptor(descriptor) &&
                    descriptor.attributeHeader.localIdentifier === attributeId
                );
            },
        );

        if (attributeIdx === -1) {
            return false;
        }

        const headers = this.allHeaders()[this._measureGroupHeaderIdx][attributeIdx];
        const attributeElement = attributeLocatorElement(locator);

        return (
            headers.find(
                (header) =>
                    isResultAttributeHeader(header) && header.attributeHeaderItem.uri === attributeElement,
            ) !== undefined
        );
    };

    private matchMeasureSortItem = (sortItem: IMeasureSortItem): boolean => {
        if (!this._measureGroupHeader) {
            /*
             * Measure sort exists but there are no measures in the result. This is unlike as
             * at latest the backend would bomb that the sort references invalid measure.
             */
            return false;
        }

        return sortMeasureLocators(sortItem).every((locator) => {
            if (isAttributeLocator(locator)) {
                return this.matchAttributeLocator(locator);
            } else if (isMeasureLocator(locator)) {
                return this._measureDescriptorByLocalId[locator.measureLocatorItem.measureIdentifier];
            }

            return false;
        });
    };

    private matchSortItem = (sortItem: ISortItem): boolean => {
        if (isAttributeSort(sortItem)) {
            return true;
        }

        return this.matchMeasureSortItem(sortItem);
    };

    public effectiveSortItems(): ISortItem[] {
        return this.dataView.definition.sortBy.filter(this.matchSortItem);
    }
}

export function newResultMetaMethods(dataView: IDataView): IResultMetaMethods {
    return new ResultMetaMethods(dataView);
}
