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
        this._bucketById = dataView.executionDefinition.buckets.reduce((acc: BucketIndex, val) => {
            const id = val.localIdentifier ? val.localIdentifier : "unknown";
            acc[id] = val;
            return acc;
        }, {});
    }

    //
    // bucket ops
    //

    public buckets(): IBucket[] {
        return this.dataView.executionDefinition.buckets;
    }

    public bucket(id: string): IBucket | undefined {
        return this._bucketById[id];
    }

    public bucketCount(): number {
        return this.dataView.executionDefinition.buckets.length;
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
        return this.dataView.executionDefinition.measures.find(m => m.measure.localIdentifier === id);
    }

    public measureIndex(id: string): number {
        return this.dataView.executionDefinition.measures.findIndex(m => m.measure.localIdentifier === id);
    }

    public masterMeasureForDerived(id: string): IMeasure | undefined {
        const maybeDerived = this.measure(id);

        if (!maybeDerived) {
            return;
        }

        const definition = maybeDerived.measure.definition;

        if (isPoPMeasureDefinition(definition)) {
            return this.measure(definition.popMeasureDefinition.measureIdentifier);
        } else if (isPreviousPeriodMeasure(definition)) {
            return this.measure(definition.previousPeriodMeasure.measureIdentifier);
        }

        return;
    }

    public hasMeasures(): boolean {
        return this.dataView.executionDefinition.measures.length > 0;
    }

    //
    // attribute ops
    //

    public hasAttributes(): boolean {
        return this.dataView.executionDefinition.attributes.length > 0;
    }

    //
    // header ops
    //

    public dimensions(): IResultDimension[] {
        return this.dataView.fromResult.dimensions;
    }

    public attributeHeaders(): IResultAttributeHeaderItem[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeaderItem[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeaderItem(headerList[0]),
            ) as IResultAttributeHeaderItem[][];
        });
    }

    public isDerivedMeasure(measureHeader: IMeasureHeaderItem): boolean {
        return this.dataView.executionDefinition.measures.some((measure: IMeasure) => {
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

    public twoDimData(): DataValue[][] {
        const d = this.dataView.data;
        const e = d[0];

        if (d === null || e === null) {
            return [[]];
        }

        return isArray(e) ? (d as DataValue[][]) : ([d] as DataValue[][]);
    }

    public afm() {
        const { attributes, measures, filters } = this.dataView.executionDefinition;

        return {
            attributes: attributes.map(a => a.attribute),
            measures: measures.map(m => m.measure),
            filters,
        };
    }

    public fingerprint() {
        return this.dataView.fingerprint;
    }
}
