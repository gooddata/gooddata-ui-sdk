// (C) 2019 GoodData Corporation

import { ExecutionError, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    IDimension,
    SortItem,
    defFingerprint,
    IExecutionDefinition,
    DimensionGenerator,
    defWithDimensions,
    defWithSorting,
} from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerExecutionResult } from "./executionResult";
import { executeAfm } from "./gd-tiger-client/execution";
import { toAfmExecution } from "./toAfm/toAfmResultSpec";

export class TigerPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;
    private _fingerprint: string | undefined;

    constructor(private readonly axios: AxiosInstance, def: IExecutionDefinition) {
        this.definition = def;
    }

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const afmExecution = toAfmExecution(this.definition);

        return executeAfm(this.axios, afmExecution)
            .then(response => {
                return new TigerExecutionResult(this.axios, this.definition, response);
            })
            .catch(e => {
                throw new ExecutionError("An error has occurred while doing execution on backend", e);
            });
    }

    public withDimensions(...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, defWithDimensions(this.definition, dimsOrGen));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, defWithSorting(this.definition, items));
    }

    public fingerprint(): string {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.fingerprint() === other.fingerprint();
    }
}

// @ts-ignore
function checkDefIsExecutable(def: IExecutionDefinition): void {
    return;
}
