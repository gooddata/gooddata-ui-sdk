// (C) 2019-2020 GoodData Corporation
import {
    IDataView,
    IDimensionDescriptor,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultHeader,
    DataValue,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeOrMeasure,
    DimensionGenerator,
    IBucket,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IInsightDefinition,
    ISortItem,
} from "@gooddata/sdk-model";
import identity = require("lodash/identity");

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

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return this.wrap(this.decorated.forDefinition(def));
    }

    public forItems(items: IAttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forItems(items, filters));
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forBuckets(buckets, filters));
    }

    public forInsight(insight: IInsightDefinition, filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forInsight(insight, filters));
    }

    public forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution> {
        return this.decorated.forInsightByRef(uri, filters).then(this.wrap);
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
    protected wrap = (execution: IPreparedExecution) => {
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

    protected constructor(protected readonly decorated: IPreparedExecution) {
        this.definition = decorated.definition;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.decorated.equals(other);
    }

    public execute(): Promise<IExecutionResult> {
        return this.decorated.execute();
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }

    public withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.createNew(this.decorated.withDimensions(...dim));
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.createNew(this.decorated.withSorting(...items));
    }

    /**
     * Methods that create new instances of prepared executions (withDimensions, withSorting) will
     * call out to this method to create decorated execution. This is essential to maintain the decoration
     * during immutable operations where decorated implementation creates new instances.
     *
     * @param decorated - instance to decorate
     */
    protected abstract createNew(decorated: IPreparedExecution): IPreparedExecution;
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
    ) {
        this.definition = decorated.definition;
        this.dimensions = decorated.dimensions;
    }

    public export(options: IExportConfig): Promise<IExportResult> {
        return this.decorated.export(options);
    }

    public readAll(): Promise<IDataView> {
        return this.decorated.readAll();
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
    public definition: IExecutionDefinition;
    public result: IExecutionResult;

    constructor(private readonly decorated: IDataView, result?: IExecutionResult) {
        this.result = result ?? decorated.result;

        this.count = decorated.count;
        this.data = decorated.data;
        this.definition = decorated.definition;
        this.headerItems = decorated.headerItems;
        this.offset = decorated.offset;
        this.totalCount = decorated.totalCount;
        this.totals = decorated.totals;
    }

    public equals(other: IDataView): boolean {
        return this.decorated.equals(other);
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }
}
