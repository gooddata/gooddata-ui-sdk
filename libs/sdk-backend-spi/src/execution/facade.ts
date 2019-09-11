// (C) 2019 GoodData Corporation
import {
    IMeasure,
    isMeasure,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasure,
    IBucket,
} from "@gooddata/sdk-model";
import isArray from "lodash/isArray";
import { IDataView } from "./index";
import {
    DataValue,
    IMeasureHeaderItem,
    IResultAttributeHeaderItem,
    IResultDimension,
    IResultHeaderItem,
    isResultAttributeHeaderItem,
    IMeasureGroupHeader,
    isMeasureGroupHeader,
} from "./results";

type BucketIndex = {
    [key: string]: IBucket;
};

/**
 * TODO: SDK8: add docs
 * @public
 */
export class DataViewFacade {
    private readonly _bucketById: BucketIndex;

    constructor(private dataView: IDataView) {
        this._bucketById = dataView.definition.buckets.reduce((acc: BucketIndex, val) => {
            const id = val.localIdentifier ? val.localIdentifier : "unknown";
            acc[id] = val;
            return acc;
        }, {});
    }

    //
    // bucket ops
    //

    public buckets(): IBucket[] {
        return this.dataView.definition.buckets;
    }

    public bucket(id: string): IBucket | undefined {
        return this._bucketById[id];
    }

    public bucketCount(): number {
        return this.dataView.definition.buckets.length;
    }

    public hasBuckets(): boolean {
        return this.bucketCount() > 0;
    }

    public isBucketEmpty(id: string): boolean {
        return !this._bucketById[id] || this._bucketById[id].items.length === 0;
    }

    public bucketMeasures(id: string, ifNoBucket: IMeasure[] = []): IMeasure[] {
        const bucket = this.bucket(id);

        return bucket ? bucket.items.filter(isMeasure) : ifNoBucket;
    }

    //
    //
    //
    public measure(id: string): IMeasure | undefined {
        return this.dataView.definition.measures.find(m => m.measure.localIdentifier === id);
    }

    public measureIndex(id: string): number {
        return this.dataView.definition.measures.findIndex(m => m.measure.localIdentifier === id);
    }

    public masterMeasureForDerived(id: string): IMeasure | undefined {
        const measure = this.measure(id);

        if (!measure) {
            return;
        }

        const definition = measure.measure.definition;

        if (isPoPMeasureDefinition(definition)) {
            return this.measure(definition.popMeasureDefinition.measureIdentifier);
        } else if (isPreviousPeriodMeasure(definition)) {
            return this.measure(definition.previousPeriodMeasure.measureIdentifier);
        }

        return measure;
    }

    public hasMeasures(): boolean {
        return this.dataView.definition.measures.length > 0;
    }

    //
    // attribute ops
    //

    public hasAttributes(): boolean {
        return this.dataView.definition.attributes.length > 0;
    }

    //
    // header ops
    //

    public dimensions(): IResultDimension[] {
        return this.dataView.result.dimensions;
    }

    public attributeHeaders(): IResultAttributeHeaderItem[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeaderItem[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeaderItem(headerList[0]),
            ) as IResultAttributeHeaderItem[][];
        });
    }

    public measureGroupHeader(): IMeasureGroupHeader | undefined {
        for (const dim of this.dataView.result.dimensions) {
            const measureGroupHeader = dim.headers.find(isMeasureGroupHeader);

            if (measureGroupHeader) {
                return measureGroupHeader;
            }
        }

        return;
    }

    public measureGroupHeaderItems(): IMeasureHeaderItem[] {
        const header = this.measureGroupHeader();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureGroupHeaderItem(id: string): IMeasureHeaderItem | undefined {
        return this.measureGroupHeaderItems().find(i => i.measureHeaderItem.localIdentifier === id);
    }

    public isDerivedMeasure(measureHeader: IMeasureHeaderItem): boolean {
        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (measure.measure.localIdentifier !== measureHeader.measureHeaderItem.localIdentifier) {
                return false;
            }

            const definition = measure.measure.definition;

            return isPoPMeasureDefinition(definition) || isPreviousPeriodMeasure(definition);
        });
    }

    //
    // data ops
    //

    public data(): DataValue[][] | DataValue[] {
        return this.dataView.data;
    }

    public singleDimData(): DataValue[] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

        if (e === null || !e) {
            return [];
        }

        if (isArray(e)) {
            // TODO: SDK8: switch to invariant?
            throw new Error();
        }

        return d as DataValue[];
    }

    public twoDimData(): DataValue[][] {
        const d = this.dataView.data;

        if (d === null) {
            return [[]];
        }

        const e = d[0];

        if (e === null || !e) {
            return [[]];
        }

        return isArray(e) ? (d as DataValue[][]) : ([d] as DataValue[][]);
    }

    public fingerprint() {
        return this.dataView.fingerprint;
    }
}
