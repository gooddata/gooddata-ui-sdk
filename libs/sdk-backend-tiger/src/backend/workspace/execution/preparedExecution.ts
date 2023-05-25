// (C) 2019-2023 GoodData Corporation

import {
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ExplainConfig,
    IExplainProvider,
    ExplainType,
    NoDataError,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    defWithExecConfig,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
    defWithDateFormat,
    IExecutionConfig,
    isPositiveAttributeFilter,
    filterIsEmpty,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import { AxiosRequestConfig } from "axios";
import { TigerExecutionResult } from "./executionResult.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec.js";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { downloadFile } from "../../../utils/downloadFile.js";

export class TigerPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        private readonly dateFormatter: DateFormatter,
    ) {}

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const afmExecution = toAfmExecution(this.definition);

        return this.authCall((client) =>
            client.execution.computeReport({
                workspaceId: this.definition.workspace,
                afmExecution,
            }),
        ).then((response) => {
            return new TigerExecutionResult(
                this.authCall,
                this.definition,
                this.executionFactory,
                response.data,
                this.dateFormatter,
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
        return this.executionFactory.forDefinition(defWithDimensions(this.definition, ...dimsOrGen));
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items));
    }

    public withDateFormat(dateFormat: string): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithDateFormat(this.definition, dateFormat));
    }

    public fingerprint(): string {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    }

    public withExecConfig(config: IExecutionConfig): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithExecConfig(this.definition, config));
    }

    public equals(other: IPreparedExecution): boolean {
        return isEqual(this.definition, other.definition);
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
