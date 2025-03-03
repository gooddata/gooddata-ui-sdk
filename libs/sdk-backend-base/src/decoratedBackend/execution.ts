// (C) 2019-2025 GoodData Corporation
import {
    IDataView,
    IForecastView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    ExplainConfig,
    IExplainProvider,
    ExplainType,
    IForecastResult,
    IForecastConfig,
    IAnomalyDetectionConfig,
    IAnomalyDetectionResult,
    IClusteringConfig,
    IClusteringResult,
    IPreparedExecutionOptions,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeOrMeasure,
    DimensionGenerator,
    IBucket,
    IDimension,
    IExecutionDefinition,
    IInsightDefinition,
    ISortItem,
    IInsight,
    INullableFilter,
    IExecutionConfig,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
    IResultWarning,
} from "@gooddata/sdk-model";
import identity from "lodash/identity.js";

/**
 * @alpha
 */
export type PreparedExecutionWrapper = (execution: IPreparedExecution) => IPreparedExecution;

/**
 * Base class for execution factory decorators. Implements all delegates.
 *
 * There is an opt-in functionality to decorate the prepared executions - which is a typical use case for
 * factory decorators.
 *
 * @alpha
 */
export class DecoratedExecutionFactory implements IExecutionFactory {
    constructor(
        protected readonly decorated: IExecutionFactory,
        private readonly wrapper: PreparedExecutionWrapper = identity,
    ) {}

    public forDefinition(def: IExecutionDefinition, options?: IPreparedExecutionOptions): IPreparedExecution {
        return this.wrap(this.decorated.forDefinition(def, options));
    }

    public forItems(
        items: IAttributeOrMeasure[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.wrap(this.decorated.forItems(items, filters, options));
    }

    public forBuckets(
        buckets: IBucket[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.wrap(this.decorated.forBuckets(buckets, filters, options));
    }

    public forInsight(
        insight: IInsightDefinition,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.wrap(this.decorated.forInsight(insight, filters, options));
    }

    public forInsightByRef(
        insight: IInsight,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.wrap(this.decorated.forInsightByRef(insight, filters, options));
    }

    /**
     * This method is a hook that can be used to wrap the execution prepared by the decorated factory - in essence
     * to keep the decorator chain going and add extra functionality to the prepared execution.
     *
     * By default, this method will call the wrapper function passed to this class at construction time - so use
     * that unless you need anything more fancy.
     *
     * @param execution - execution to wrap
     */
    protected wrap = (execution: IPreparedExecution): IPreparedExecution => {
        return this.wrapper(execution);
    };
}

/**
 * Abstract base class for prepared execution decorators. Implements delegates to decorated execution. Concrete
 * implementations can override just the functions they are interested in.
 *
 * @alpha
 */
export abstract class DecoratedPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;

    protected constructor(
        protected readonly decorated: IPreparedExecution,
        public readonly signal: AbortSignal | undefined = decorated.signal,
    ) {
        this.definition = decorated.definition;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.decorated.equals(other);
    }

    public execute(): Promise<IExecutionResult> {
        return this.decorated.execute();
    }

    public withSignal(signal: AbortSignal): IPreparedExecution {
        return this.createNew(this.decorated.withSignal(signal), signal);
    }

    public explain<T extends ExplainType | undefined>(
        config: ExplainConfig<T>,
    ): IExplainProvider<typeof config["explainType"]> {
        return this.decorated.explain(config);
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }

    public withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.createNew(this.decorated.withDimensions(...dim), this.signal);
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.createNew(this.decorated.withSorting(...items), this.signal);
    }

    public withBuckets(...buckets: IBucket[]): IPreparedExecution {
        return this.createNew(this.decorated.withBuckets(...buckets), this.signal);
    }

    public withDateFormat(dateFormat: string): IPreparedExecution {
        return this.createNew(this.decorated.withDateFormat(dateFormat), this.signal);
    }

    public withExecConfig(config: IExecutionConfig): IPreparedExecution {
        return this.createNew(this.decorated.withExecConfig(config), this.signal);
    }

    /**
     * Methods that create new instances of prepared executions (withDimensions, withSorting, withDateFormat) will
     * call out to this method to create decorated execution. This is essential to maintain the decoration
     * during immutable operations where decorated implementation creates new instances.
     *
     * @param decorated - instance to decorate
     */
    protected abstract createNew(decorated: IPreparedExecution, signal?: AbortSignal): IPreparedExecution;
}

/**
 * Abstract base class for execution result decorators. Implements delegates to decorated execution. Concrete
 * implementations can override just the functions they are interested in.
 *
 * The prepared execution wrap is needed here because of the transform function which normally creates new
 * instances of prepared execution - and so the decoration needs to be maintained.
 *
 * @alpha
 */
export abstract class DecoratedExecutionResult implements IExecutionResult {
    public definition: IExecutionDefinition;
    public dimensions: IDimensionDescriptor[];

    protected constructor(
        private readonly decorated: IExecutionResult,
        private readonly wrapper: PreparedExecutionWrapper = identity,
        public readonly signal: AbortSignal | undefined = decorated.signal,
    ) {
        this.definition = decorated.definition;
        this.dimensions = decorated.dimensions;
    }

    public export(options: IExportConfig): Promise<IExportResult> {
        return this.decorated.export(options);
    }

    public exportRaw(filename: string): Promise<IExportResult> {
        return this.decorated.exportRaw!(filename);
    }

    public readAll(): Promise<IDataView> {
        return this.decorated.readAll();
    }

    public readForecastAll(config: IForecastConfig): Promise<IForecastResult> {
        return this.decorated.readForecastAll(config);
    }

    public readAnomalyDetectionAll(config: IAnomalyDetectionConfig): Promise<IAnomalyDetectionResult> {
        return this.decorated.readAnomalyDetectionAll(config);
    }

    public readClusteringAll(config: IClusteringConfig): Promise<IClusteringResult> {
        return this.decorated.readClusteringAll(config);
    }

    public readWindow(offset: number[], size: number[]): Promise<IDataView> {
        return this.decorated.readWindow(offset, size);
    }

    public transform(): IPreparedExecution {
        return this.wrapper(this.decorated.transform());
    }

    public equals(other: IExecutionResult): boolean {
        return this.decorated.equals(other);
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }
}

/**
 * Abstract base class for data view decorators. Implements delegates to decorated data view. Concrete
 * implementations can override just the functions they are interested in.
 *
 * @alpha
 */
export abstract class DecoratedDataView implements IDataView {
    public offset: number[];
    public count: number[];
    public totalCount: number[];
    public headerItems: IResultHeader[][][];
    public data: DataValue[] | DataValue[][];
    public totals?: DataValue[][][];
    public totalTotals?: DataValue[][][];
    public definition: IExecutionDefinition;
    public result: IExecutionResult;
    public warnings?: IResultWarning[];
    public forecastConfig?: IForecastConfig;
    public forecastResult?: IForecastResult;

    constructor(private readonly decorated: IDataView, result?: IExecutionResult) {
        this.result = result ?? decorated.result;
        this.forecastConfig = decorated.forecastConfig;
        this.forecastResult = decorated.forecastResult;

        this.count = decorated.count;
        this.data = decorated.data;
        this.definition = decorated.definition;
        this.headerItems = decorated.headerItems;
        this.offset = decorated.offset;
        this.totalCount = decorated.totalCount;
        this.totals = decorated.totals;
        this.totalTotals = decorated.totalTotals;
        this.warnings = decorated.warnings;
    }

    public equals(other: IDataView): boolean {
        return this.decorated.equals(other);
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }

    public withForecast(config?: IForecastConfig, result?: IForecastResult): IDataView {
        return this.decorated.withForecast(config, result);
    }

    public forecast(): IForecastView {
        return this.decorated.forecast();
    }

    clustering(): IClusteringResult {
        return this.decorated.clustering();
    }

    withClustering(config?: IClusteringConfig, result?: IClusteringResult): IDataView {
        return this.decorated.withClustering(config, result);
    }
}
