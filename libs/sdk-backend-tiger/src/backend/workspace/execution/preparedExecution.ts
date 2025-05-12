// (C) 2019-2025 GoodData Corporation

import {
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ExplainConfig,
    IExplainProvider,
    ExplainType,
    NoDataError,
    IPreparedExecutionOptions,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    defWithExecConfig,
    defWithBuckets,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
    defWithDateFormat,
    IExecutionConfig,
    isPositiveAttributeFilter,
    filterIsEmpty,
    IBucket,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { AxiosRequestConfig } from "axios";
import { TigerExecutionResult } from "./executionResult.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec.js";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { downloadFile } from "../../../utils/downloadFile.js";
import { TigerCancellationConverter } from "../../../cancelation/index.js";

export class TigerPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;
    public readonly signal: AbortSignal | undefined = undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        private readonly dateFormatter: DateFormatter,
        public readonly options?: IPreparedExecutionOptions,
    ) {
        this.signal = this.options?.signal;
    }

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const afmExecution = toAfmExecution(this.definition);

        return this.authCall((client) =>
            client.execution.computeReport(
                {
                    workspaceId: this.definition.workspace,
                    afmExecution,
                },
                { ...new TigerCancellationConverter(this.signal ?? null).forAxios() },
            ),
        ).then((response) => {
            let resultCancelToken: string | undefined = undefined;
            if (this.signal) {
                resultCancelToken = response?.headers["x-gdc-cancel-token"];
            }
            return new TigerExecutionResult(
                this.authCall,
                this.definition,
                this.executionFactory,
                response.data,
                this.dateFormatter,
                this.signal,
                resultCancelToken,
            );
        });
    }

    public explain<T extends ExplainType | undefined>({
        explainType,
    }: ExplainConfig<T>): IExplainProvider<T> {
        return {
            download: () => {
                return explainCall<T>(this.definition, this.authCall, explainType, "blob")
                    .then(
                        (response) =>
                            response && downloadFile(getExplainFileName(explainType), response.data),
                    )
                    .catch((error) => {
                        console.warn(error);
                    });
            },
            data: () => {
                if (!explainType) {
                    return Promise.reject(
                        new Error(`There must be defined "explainType" on ExplainConfig to get data.`),
                    );
                }
                return explainCall<T>(this.definition, this.authCall, explainType, "text").then(
                    (response) =>
                        new Promise((resolve, reject) => {
                            if (response) {
                                resolve(response.data);
                                return;
                            }
                            reject(new Error(`Definition is not set or there is no response from server.`));
                        }),
                );
            },
        };
    }

    public withDimensions(...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.executionFactory.forDefinition(
            defWithDimensions(this.definition, ...dimsOrGen),
            this.options,
        );
    }

    public withBuckets(...buckets: IBucket[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithBuckets(this.definition, ...buckets), this.options);
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items), this.options);
    }

    public withSignal(signal: AbortSignal): IPreparedExecution {
        return new TigerPreparedExecution(
            this.authCall,
            this.definition,
            this.executionFactory,
            this.dateFormatter,
            { ...this.options, signal },
        );
    }

    public withDateFormat(dateFormat: string): IPreparedExecution {
        return this.executionFactory.forDefinition(
            defWithDateFormat(this.definition, dateFormat),
            this.options,
        );
    }

    public fingerprint(): string {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    }

    public withExecConfig(config: IExecutionConfig): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithExecConfig(this.definition, config), this.options);
    }

    public equals(other: IPreparedExecution): boolean {
        return isEqual(defFingerprint(this.definition), defFingerprint(other.definition));
    }
}

function checkDefIsExecutable(def: IExecutionDefinition): void {
    if (def.filters?.some((filter) => isPositiveAttributeFilter(filter) && filterIsEmpty(filter))) {
        throw new NoDataError("Server returned no data");
    }
}

async function explainCall<T extends ExplainType | undefined>(
    definition: IExecutionDefinition,
    authCall: TigerPreparedExecution["authCall"],
    explainType: ExplainConfig<T>["explainType"],
    responseType: AxiosRequestConfig["responseType"],
) {
    if (definition) {
        return authCall((client) =>
            client.explain.explainAFM(
                {
                    workspaceId: definition.workspace,
                    afmExecution: toAfmExecution(definition),
                    explainType,
                },
                {
                    responseType,
                },
            ),
        );
    }
    return Promise.resolve();
}

function getExplainFileName(explainType: ExplainType | undefined) {
    switch (explainType) {
        case "SQL":
            return `${explainType}.sql`;
        case "QT":
        case "MAQL":
        case "WDF":
        case "GRPC_MODEL":
        case "OPT_QT":
            return `${explainType}.json`;
        case "OPT_QT_SVG":
        case "QT_SVG":
            return `${explainType}.svg`;
        default:
            return "explainAfm.zip";
    }
}
