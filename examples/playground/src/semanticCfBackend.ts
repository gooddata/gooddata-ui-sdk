// (C) 2026 GoodData Corporation

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

export function parseSemanticCfSimConfig(raw: string | undefined): SemanticCfSimConfig | undefined {
    if (!raw) {
        return undefined;
    }
    try {
        return JSON.parse(raw) as SemanticCfSimConfig;
    } catch {
        console.error("VITE_SEMANTIC_CF is not valid JSON, ignoring.");
        return undefined;
    }
}

function withOverriddenResult(dataView: IDataView, result: IExecutionResult): IDataView {
    return Object.assign(Object.create(Object.getPrototypeOf(dataView)), dataView, { result });
}

function injectSemanticConditionalFormatting(
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
