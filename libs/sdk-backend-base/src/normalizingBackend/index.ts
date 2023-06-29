// (C) 2007-2023 GoodData Corporation

import {
    IAnalyticalBackend,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IPreparedExecution,
    IExportResult,
    NotSupported,
    isNoDataError,
    NoDataError,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import { decoratedBackend } from "../decoratedBackend/index.js";
import { DecoratedExecutionFactory, DecoratedPreparedExecution } from "../decoratedBackend/execution.js";
import {
    defFingerprint,
    IExecutionDefinition,
    IFilter,
    IInsight,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
} from "@gooddata/sdk-model";
import { Denormalizer, NormalizationState, Normalizer } from "./normalizer.js";
import cloneDeep from "lodash/cloneDeep.js";

class WithNormalizationExecutionFactory extends DecoratedExecutionFactory {
    constructor(decorated: IExecutionFactory, private readonly config: NormalizationConfig) {
        super(decorated);
    }

    forInsightByRef(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const isFallbackAllowed = this.config.executeByRefMode === "fallback";

        if (isFallbackAllowed) {
            return this.forInsight(insight, filters);
        }

        throw new NotSupported(
            "Execution by reference is not supported when using normalizing backend. " +
                "Use forInsight() instead.",
        );
    }

    protected wrap = (original: IPreparedExecution): IPreparedExecution => {
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

    public execute = (): Promise<IExecutionResult> => {
        const normalizationState = Normalizer.normalize(this.definition);
        const normalizedExecution = this.originalExecutionFactory.forDefinition(
            normalizationState.normalized,
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
class DenormalizingExecutionResult implements IExecutionResult {
    public readonly definition: IExecutionDefinition;
    public readonly dimensions: IDimensionDescriptor[];
    private readonly denormalizer: Denormalizer;
    private readonly _fingerprint: string;

    constructor(
        private readonly normalizedResult: IExecutionResult,
        private readonly normalizationState: NormalizationState,
        private readonly normalizingExecution: IPreparedExecution,
        private readonly originalExecution: IPreparedExecution,
    ) {
        this.denormalizer = Denormalizer.from(normalizationState);

        this.definition = this.normalizationState.original;
        this.dimensions = this.denormalizer.denormalizeDimDescriptors(normalizedResult.dimensions);
        this._fingerprint = `normalizedResult_${defFingerprint(this.definition)}`;
    }

    public transform = (): IPreparedExecution => {
        return this.normalizingExecution;
    };

    public export = async (options: IExportConfig): Promise<IExportResult> => {
        const originalResult = await this.originalExecution.execute();

        return originalResult.export(options);
    };

    public exportToBlob = async (options: IExportConfig): Promise<IExportBlobResult> => {
        const originalResult = await this.originalExecution.execute();

        return originalResult.exportToBlob(options);
    };

    public readAll = (): Promise<IDataView> => {
        const promisedDataView = this.normalizedResult.readAll();

        return promisedDataView
            .then((dataView) => {
                return new DenormalizedDataView(this, dataView, this.denormalizer);
            })
            .catch(this.handleDataViewError);
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        const promisedDataView = this.normalizedResult.readWindow(offset, size);

        return promisedDataView
            .then((dataView) => {
                return new DenormalizedDataView(this, dataView, this.denormalizer);
            })
            .catch(this.handleDataViewError);
    };

    public equals = (other: IExecutionResult): boolean => {
        return this._fingerprint === other.fingerprint();
    };

    public fingerprint = (): string => {
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
}

/**
 * Denormalized DataView takes mostly copies of the contents of the normalized data view. The only exception is the
 * header items. The measure headers included therein may have normalized, incorrect measure names (defaulted by
 * backend to localId).
 */
class DenormalizedDataView implements IDataView {
    public readonly definition: IExecutionDefinition;
    public readonly result: IExecutionResult;

    public readonly data: DataValue[][] | DataValue[];
    public readonly headerItems: IResultHeader[][][];
    public readonly offset: number[];
    public readonly count: number[];
    public readonly totalCount: number[];
    public readonly totals: DataValue[][][] | undefined;
    public readonly totalTotals: DataValue[][][] | undefined;

    private readonly _fingerprint: string;

    constructor(
        result: DenormalizingExecutionResult,
        private readonly normalizedDataView: IDataView,
        denormalizer: Denormalizer,
    ) {
        this.result = result;
        this.definition = this.result.definition;
        this.count = cloneDeep(this.normalizedDataView.count);
        this.data = cloneDeep(this.normalizedDataView.data);
        this.headerItems = denormalizer.denormalizeHeaders(this.normalizedDataView.headerItems);
        this.offset = cloneDeep(this.normalizedDataView.offset);
        this.totalCount = cloneDeep(this.normalizedDataView.totalCount);
        this.totals = cloneDeep(this.normalizedDataView.totals);
        this.totalTotals = cloneDeep(this.normalizedDataView.totalTotals);

        this._fingerprint = `${this.result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
    }

    public equals = (other: IDataView): boolean => {
        return this._fingerprint === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fingerprint;
    };
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
