// (C) 2026 GoodData Corporation

// Twin of sdk/examples/playground/src/semanticCfBackend.ts (same simulation, different trigger —
// backend.ts reads a window global instead of a Vite env var). Keep both in sync; delete both once
// the real backend ships these fields.

import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    type PreparedExecutionWrapper,
    decoratedBackend,
} from "@gooddata/sdk-backend-base";
import {
    type IAnalyticalBackend,
    type IDataView,
    type IExecutionResult,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IDimensionDescriptor,
    type ISemanticConditionalFormatting,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";

export type SemanticCfSimConfig = Record<string, ISemanticConditionalFormatting>;

// Known gap: withForecast/withOutliers/withClustering (DecoratedDataView) delegate to their own
// private pre-injection view, not to `result`, so a view produced by calling one of those on the
// return value here loses the injected conditionalFormatting. Not fixed: CF is pivot-table-only and
// never calls them, so this doesn't affect the scenario this simulator exists to support.
function withOverriddenResult(dataView: IDataView, result: IExecutionResult): IDataView {
    return Object.assign(Object.create(Object.getPrototypeOf(dataView)), dataView, { result });
}

// Exported (unlike its playground twin) so it's directly testable: dummyBackendEmptyData's
// execution results always carry an empty dimensions array, so exercising this through a full
// backend/execution chain in a test can't reach any real descriptor to inject into.
export function injectSemanticConditionalFormatting(
    dimensions: IDimensionDescriptor[],
    simConfig: SemanticCfSimConfig,
): IDimensionDescriptor[] {
    return dimensions.map((dimension) => ({
        ...dimension,
        headers: dimension.headers.map((header) => {
            if (isAttributeDescriptor(header)) {
                const conditionalFormatting = simConfig[header.attributeHeader.localIdentifier];
                return conditionalFormatting
                    ? { attributeHeader: { ...header.attributeHeader, conditionalFormatting } }
                    : header;
            }
            if (isMeasureGroupDescriptor(header)) {
                return {
                    measureGroupHeader: {
                        ...header.measureGroupHeader,
                        items: header.measureGroupHeader.items.map((measure) => {
                            const conditionalFormatting =
                                simConfig[measure.measureHeaderItem.localIdentifier];
                            return conditionalFormatting
                                ? {
                                      measureHeaderItem: {
                                          ...measure.measureHeaderItem,
                                          conditionalFormatting,
                                      },
                                  }
                                : measure;
                        }),
                    },
                };
            }
            return header;
        }),
    }));
}

class SemanticCfExecutionResult extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        private readonly execWrapper: PreparedExecutionWrapper,
        private readonly simConfig: SemanticCfSimConfig,
    ) {
        super(decorated, execWrapper);
        this.dimensions = injectSemanticConditionalFormatting(decorated.dimensions, simConfig);
    }

    public override readAll = async (): Promise<IDataView> => {
        return withOverriddenResult(await super.readAll(), this);
    };

    public override readWindow = async (offset: number[], size: number[]): Promise<IDataView> => {
        return withOverriddenResult(await super.readWindow(offset, size), this);
    };

    protected createNew = (decorated: IExecutionResult): IExecutionResult => {
        return new SemanticCfExecutionResult(decorated, this.execWrapper, this.simConfig);
    };
}

class SemanticCfPreparedExecution extends DecoratedPreparedExecution {
    constructor(
        decorated: IPreparedExecution,
        private readonly simConfig: SemanticCfSimConfig,
    ) {
        super(decorated);
    }

    public override execute = async (): Promise<IExecutionResult> => {
        return new SemanticCfExecutionResult(await super.execute(), this.createNew, this.simConfig);
    };

    protected createNew = (decorated: IPreparedExecution): IPreparedExecution => {
        return new SemanticCfPreparedExecution(decorated, this.simConfig);
    };
}

export function withSemanticCfSimulation(
    backend: IAnalyticalBackend,
    simConfig: SemanticCfSimConfig | undefined,
): IAnalyticalBackend {
    if (!simConfig) {
        return backend;
    }
    return decoratedBackend(backend, {
        execution: (factory) =>
            new DecoratedExecutionFactory(
                factory,
                (execution) => new SemanticCfPreparedExecution(execution, simConfig),
            ),
    });
}
