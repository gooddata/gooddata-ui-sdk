// (C) 2019-2020 GoodData Corporation
import { IAttribute, IBucket, IExecutionDefinition, IMeasure } from "@gooddata/sdk-model";
import {
    DataValue,
    IDataView,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IExecutionResult,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinitionMethods, newExecutionDefinitonMethods } from "./internal/definitionMethods";
import { IResultMetaMethods, newResultMetaMethods } from "./internal/resultMetaMethods";
import { IResultDataMethods, newResultDataMethods } from "./internal/resultDataMethods";

/**
 * This wrapper for {@link IDataView} provides various convenience methods to work with data and metadata stored inside
 * the provided instance of {@link IDataView}.
 *
 * The facade keeps an ephemeral state - such as calculated indexes on top of the headers in the {@link IDataView} -
 * to optimize performance of often-used lookups at the cost of extra memory.
 *
 * The facade is part of the public API and we strongly recommend to use it whenever client code needs to work with
 * data view; ideally, single instance of data view facade
 *
 * Note: the facade is currently in alpha quality - mix-match of various functions we found useful so far; consolidation
 * and further enhancements will happen, the methods will be removed, renamed and added in the future. The public
 * API WILL break.
 *
 * TODO: move more added-value functions here, clean up, consolidate, modularize
 * @alpha
 */
export class DataViewFacade implements IExecutionDefinitionMethods, IResultMetaMethods, IResultDataMethods {
    public readonly definition: IExecutionDefinition;

    private readonly definitionMethods: IExecutionDefinitionMethods;
    private readonly resultMetaMethods: IResultMetaMethods;
    private readonly resultDataMethods: IResultDataMethods;

    protected constructor(public readonly dataView: IDataView) {
        this.definition = dataView.definition;

        this.definitionMethods = newExecutionDefinitonMethods(dataView.definition);
        this.resultMetaMethods = newResultMetaMethods(dataView);
        this.resultDataMethods = newResultDataMethods(dataView);
    }

    //
    // Own methods
    //

    public static for(dataView: IDataView): DataViewFacade {
        return new DataViewFacade(dataView);
    }

    /**
     * @returns result of execution which returned this data view
     */
    public result(): IExecutionResult {
        return this.dataView.result;
    }

    /**
     * @remarks see {@link IDataView.fingerprint} for more contractual information
     * @returns fingerprint of the data view
     */
    public fingerprint(): string {
        return this.dataView.fingerprint();
    }

    /**
     * @returns methods to work with execution definition
     */
    public def(): IExecutionDefinitionMethods {
        return this.definitionMethods;
    }

    /**
     * @returns methods to work with result metadata
     */
    public meta(): IResultMetaMethods {
        return this.resultMetaMethods;
    }

    /**
     * @returns methods to work with the raw data included in the result
     */
    public rawData(): IResultDataMethods {
        return this.resultDataMethods;
    }

    //
    // IExecutionDefinitonMethods delegates
    //

    public attributes(): IAttribute[] {
        return this.definitionMethods.attributes();
    }

    public measures(): IMeasure[] {
        return this.definitionMethods.measures();
    }

    public buckets(): IBucket[] {
        return this.definitionMethods.buckets();
    }

    public bucket(localId: string): IBucket | undefined {
        return this.definitionMethods.bucket(localId);
    }

    public bucketCount(): number {
        return this.definitionMethods.bucketCount();
    }

    public hasBuckets(): boolean {
        return this.definitionMethods.hasBuckets();
    }

    public isBucketEmpty(localId: string): boolean {
        return this.definitionMethods.isBucketEmpty(localId);
    }

    public bucketMeasures(localId: string): IMeasure[] {
        return this.definitionMethods.bucketMeasures(localId);
    }

    public measure(localId: string): IMeasure | undefined {
        return this.definitionMethods.measure(localId);
    }

    public measureIndex(localId: string): number {
        return this.definitionMethods.measureIndex(localId);
    }

    public masterMeasureForDerived(localId: string): IMeasure | undefined {
        return this.definitionMethods.masterMeasureForDerived(localId);
    }

    public hasAttributes(): boolean {
        return this.definitionMethods.hasAttributes();
    }

    //
    // IResultMetaMethods implementation
    //

    public dimensions(): IDimensionDescriptor[] {
        return this.resultMetaMethods.dimensions();
    }

    public dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[] {
        return this.resultMetaMethods.dimensionItemDescriptors(dimIdx);
    }

    public measureGroupDescriptor(): IMeasureGroupDescriptor | undefined {
        return this.resultMetaMethods.measureGroupDescriptor();
    }

    public measureDescriptors(): IMeasureDescriptor[] {
        return this.resultMetaMethods.measureDescriptors();
    }

    public measureDescriptor(localId: string): IMeasureDescriptor | undefined {
        return this.resultMetaMethods.measureDescriptor(localId);
    }

    public allHeaders(): IResultHeader[][][] {
        return this.resultMetaMethods.allHeaders();
    }

    public attributeHeaders(): IResultAttributeHeader[][][] {
        return this.resultMetaMethods.attributeHeaders();
    }

    public isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean {
        return this.resultMetaMethods.isDerivedMeasure(measureDescriptor);
    }

    //
    // IResultDataMethods delegates
    //

    public firstDimSize(): number {
        return this.resultDataMethods.firstDimSize();
    }

    public dataAt(index: number): DataValue | DataValue[] {
        return this.resultDataMethods.dataAt(index);
    }

    public data(): DataValue[][] | DataValue[] {
        return this.resultDataMethods.data();
    }

    public singleDimData(): DataValue[] {
        return this.resultDataMethods.singleDimData();
    }

    public twoDimData(): DataValue[][] {
        return this.resultDataMethods.twoDimData();
    }

    public totals(): DataValue[][][] | undefined {
        return this.resultDataMethods.totals();
    }

    public hasTotals(): boolean {
        return this.resultDataMethods.hasTotals();
    }
}
