// (C) 2007-2025 GoodData Corporation

import { cloneDeep } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IExecutionContext,
    type IExecutionFactory,
    type IExecutionResult,
    type IExecutionResultMetadata,
    type IExportConfig,
    type IExportResult,
    type IForecastConfig,
    type IForecastResult,
    type IForecastView,
    type IPreparedExecution,
    type IPreparedExecutionOptions,
    NoDataError,
    NotSupported,
    isNoDataError,
} from "@gooddata/sdk-backend-spi";
import {
    type DataValue,
    type IExecutionDefinition,
    type IFilter,
    type IInsight,
    type IResultHeader,
    defFingerprint,
} from "@gooddata/sdk-model";

import { Denormalizer, type NormalizationState, Normalizer } from "./normalizer.js";
import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
} from "../decoratedBackend/execution.js";
import { decoratedBackend } from "../decoratedBackend/index.js";

class WithNormalizationExecutionFactory extends DecoratedExecutionFactory {
    constructor(
        decorated: IExecutionFactory,
        private readonly config: NormalizationConfig,
    ) {
        super(decorated);
    }

    override forInsightByRef(
        insight: IInsight,
        filters?: IFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const isFallbackAllowed = this.config.executeByRefMode === "fallback";

        if (isFallbackAllowed) {
            return this.forInsight(insight, filters, options);
        }

        throw new NotSupported(
            "Execution by reference is not supported when using normalizing backend. " +
                "Use forInsight() instead.",
        );
    }

    protected override wrap = (original: IPreparedExecution): IPreparedExecution => {
        return new NormalizingPreparedExecution(original, this.decorated, this.config);
    };
}

/**
 * Prepared execution which does normalization. The prepared execution works with the original
 * exec definition all the time. All operations are done on top of it - except for the execution itself.
 *
 * Once the execute() is called, the prepared execution will perform normalization and will prepare execution
 * for the normalized definition. It uses the original, non-normalizing exec factory for this.
 *
 * It thus obtains the normalized execution and starts it, obtaining the normalized result.
 */
class NormalizingPreparedExecution extends DecoratedPreparedExecution {
    constructor(
        decorated: IPreparedExecution,
        private readonly originalExecutionFactory: IExecutionFactory,
        private readonly config: NormalizationConfig,
    ) {
        super(decorated);
    }

    public override execute = (): Promise<IExecutionResult> => {
        const normalizationState = Normalizer.normalize(this.definition);
        const normalizedExecution = this.originalExecutionFactory.forDefinition(
            normalizationState.normalized,
            { signal: this.signal, context: this.context },
        );

        this.config.normalizationStatus?.(normalizationState);

        return normalizedExecution.execute().then((result) => {
            return new DenormalizingExecutionResult(result, normalizationState, this, this.decorated);
        });
    };

    protected createNew = (decorated: IPreparedExecution): IPreparedExecution => {
        return new NormalizingPreparedExecution(decorated, this.originalExecutionFactory, this.config);
    };
}

/**
 * An implementation of de-normalizing execution result.
 *
 * It receives the result of normalized execution + normalization metadata, and at
 * construction time sets up the results definition to be the original definition, and
 * then de-normalizes the dimension headers so that they match the original definition.
 *
 * The result instance receives also receives the normalizing execution which triggered creation of
 * the result → this is so that when client calls transform(), they can get back to further customizing the
 * execution.
 *
 * The result instance receives also the original, non-normalizing prepared execution → this is needed
 * because of export(). Exports are a server side thing that must be done for the original execution - because
 * the normalization process normally takes away the essential detail that is important in the exports - such as
 * titles, formats and so on. See the export() implementation - this actually performs the original execution
 * and exports result from it.
 */
class DenormalizingExecutionResult extends DecoratedExecutionResult {
    private readonly denormalizer: Denormalizer;
    private readonly _fingerprint: string;

    constructor(
        decorated: IExecutionResult,
        private readonly normalizationState: NormalizationState,
        private readonly normalizingExecution: IPreparedExecution,
        private readonly originalExecution: IPreparedExecution,
    ) {
        super(decorated, () => normalizingExecution);
        this.denormalizer = Denormalizer.from(normalizationState);

        this.definition = this.normalizationState.original;
        this.dimensions = this.denormalizer.denormalizeDimDescriptors(decorated.dimensions);
        this._fingerprint = `normalizedResult_${defFingerprint(this.definition)}`;
    }

    public override transform = (): IPreparedExecution => {
        return this.normalizingExecution;
    };

    public override export = async (options: IExportConfig): Promise<IExportResult> => {
        // Avoid abort signal to be out of sync
        const originalResult = await this.originalExecution.withSignal(this.signal).execute();

        return originalResult.export(options);
    };

    public override readAll = (): Promise<IDataView> => {
        return super
            .readAll()
            .then((dataView: IDataView) => {
                return new DenormalizedDataView(this, dataView, this.denormalizer);
            })
            .catch(this.handleDataViewError);
    };

    public override readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        return super
            .readWindow(offset, size)
            .then((dataView: IDataView) => {
                return new DenormalizedDataView(this, dataView, this.denormalizer);
            })
            .catch(this.handleDataViewError);
    };

    public override equals = (other: IExecutionResult): boolean => {
        return this._fingerprint === other.fingerprint();
    };

    public override fingerprint = (): string => {
        return this._fingerprint;
    };

    private handleDataViewError = (error: unknown): never => {
        // make sure that errors with dataViews are repackaged with the dataView denormalized as well
        // otherwise the dataViews will not make sense to the caller
        if (isNoDataError(error) && error.dataView) {
            throw new NoDataError(
                error.message,
                new DenormalizedDataView(this, error.dataView, this.denormalizer),
            );
        }

        throw error;
    };

    protected createNew = (decorated: IExecutionResult): IExecutionResult => {
        return new DenormalizingExecutionResult(
            decorated,
            this.normalizationState,
            this.normalizingExecution,
            this.originalExecution,
        );
    };
}

/**
 * Denormalized DataView takes mostly copies of the contents of the normalized data view. The only exception is the
 * header items. The measure headers included therein may have normalized, incorrect measure names (defaulted by
 * backend to localId).
 */
class DenormalizedDataView implements IDataView {
    public readonly definition: IExecutionDefinition;
    public readonly result: DenormalizingExecutionResult;
    public readonly forecastConfig?: IForecastConfig;
    public readonly forecastResult?: IForecastResult;
    public readonly clusteringConfig?: IClusteringConfig;
    public readonly clusteringResult?: IClusteringResult;
    public readonly context?: IExecutionContext;

    public readonly data: DataValue[][] | DataValue[];
    public readonly headerItems: IResultHeader[][][];
    public readonly offset: number[];
    public readonly count: number[];
    public readonly totalCount: number[];
    public readonly totals: DataValue[][][] | undefined;
    public readonly totalTotals: DataValue[][][] | undefined;
    public readonly metadata: IExecutionResultMetadata;

    private readonly _fingerprint: string;
    private readonly _denormalizer: Denormalizer;

    constructor(
        result: DenormalizingExecutionResult,
        private readonly normalizedDataView: IDataView,
        denormalizer: Denormalizer,
        forecastConfig?: IForecastConfig,
        forecastResult?: IForecastResult,
        clusteringConfig?: IClusteringConfig,
        clusteringResult?: IClusteringResult,
    ) {
        this._denormalizer = denormalizer;

        this.result = result;
        this.forecastConfig = forecastConfig;
        this.forecastResult = forecastResult;
        this.clusteringConfig = clusteringConfig;
        this.clusteringResult = clusteringResult;
        this.context = cloneDeep(normalizedDataView.context);

        this.definition = this.result.definition;
        this.count = cloneDeep(this.normalizedDataView.count);
        this.data = cloneDeep(this.normalizedDataView.data);
        this.headerItems = denormalizer.denormalizeHeaders(this.normalizedDataView.headerItems);
        this.offset = cloneDeep(this.normalizedDataView.offset);
        this.totalCount = cloneDeep(this.normalizedDataView.totalCount);
        this.totals = cloneDeep(this.normalizedDataView.totals);
        this.totalTotals = cloneDeep(this.normalizedDataView.totalTotals);
        this.metadata = cloneDeep(this.normalizedDataView.metadata);

        this._fingerprint = `${this.result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
    }

    public equals = (other: IDataView): boolean => {
        return this._fingerprint === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fingerprint;
    };

    public forecast(): IForecastView {
        const data = this.normalizedDataView.forecast();

        return {
            ...data,
            headerItems: this._denormalizer.denormalizeHeaders(data.headerItems),
        };
    }

    public clustering(): IClusteringResult {
        return this.normalizedDataView.clustering();
    }

    public withForecast(config?: IForecastConfig, result?: IForecastResult): IDataView {
        const normalizedDataView = this.normalizedDataView.withForecast(config, result);
        return new DenormalizedDataView(
            this.result,
            normalizedDataView,
            this._denormalizer,
            normalizedDataView.forecastConfig,
            normalizedDataView.forecastResult,
            normalizedDataView.clusteringConfig,
            normalizedDataView.clusteringResult,
        );
    }

    public withClustering(config?: IClusteringConfig, result?: IClusteringResult): IDataView {
        const normalizedDataView = this.normalizedDataView.withClustering(config, result);
        return new DenormalizedDataView(
            this.result,
            normalizedDataView,
            this._denormalizer,
            normalizedDataView.forecastConfig,
            normalizedDataView.forecastResult,
            normalizedDataView.clusteringConfig,
            normalizedDataView.clusteringResult,
        );
    }

    public readCollectionItems(config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
        return this.normalizedDataView.readCollectionItems(config);
    }
}

/**
 * @beta
 */
export type NormalizationWhenExecuteByRef = "prohibit" | "fallback";

/**
 * @beta
 */
export type NormalizationConfig = {
    /**
     * Specify callback where the normalizing backend will dispatch state of the normalizations being done.
     */
    normalizationStatus?: (normalizationState: NormalizationState) => void;

    /**
     * Specify what should happen if the normalized backend is asked to perform execution by reference.
     *
     * Background:
     *
     * Execution by reference cannot be normalized - strictly because execution by reference executes exactly
     * what is stored somewhere on the backend (this can connect to authorization schemes, ACLs and so on - such as
     * allowing users to execute only insights exactly as they were prepared by someone else)
     *
     * By default, trying to run execute-by-reference using normalizing decorator will fail. It is possible
     * to modify this behavior so that instead there will be fallback to freeform execution. For backends that
     * do not support execute-by-ref this is all good.
     */
    executeByRefMode?: NormalizationWhenExecuteByRef;
};

/**
 * Decorates backend with logic which transparently normalizes execution definitions before they are dispatched
 * to the underlying backend. The normalization standardizes local identifiers and removes any fields that do not
 * impact the resulting data itself: aliases, title customizations and measure format customizations.
 *
 * All the detail that is stripped on the way to the execution APIs is restored before the results reach the
 * caller code.
 *
 * The normalization is essential to increase cache hits - be it both on client or on the server.
 *
 * @param realBackend - real backend to decorate
 * @param config - Specify configuration of the normalization process, see {@link NormalizationConfig}
 * @returns new instance of backend
 * @beta
 */
export function withNormalization(
    realBackend: IAnalyticalBackend,
    config: NormalizationConfig = {},
): IAnalyticalBackend {
    return decoratedBackend(realBackend, {
        execution: (original) => new WithNormalizationExecutionFactory(original, config),
    });
}
