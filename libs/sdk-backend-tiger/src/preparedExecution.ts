// (C) 2019 GoodData Corporation

import {
    defFingerprint,
    defWithDimensions,
    defWithSorts,
    DimensionGenerator,
    ExecutionError,
    IExecutionDefinition,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { IDimension, isDimension, SortItem } from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerExecutionResult } from "./executionResult";
import { executeAfm } from "./gd-tiger-client/execution";
import { toAfmExecution } from "./toAfm/toAfmResultSpec";
import isEmpty = require("lodash/isEmpty");

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
        if (!dimsOrGen || isEmpty(dimsOrGen)) {
            return this;
        }

        const maybeGenerator = dimsOrGen[0];

        if (typeof maybeGenerator === "function") {
            return new TigerPreparedExecution(
                this.axios,
                defWithDimensions(this.definition, maybeGenerator(this.definition.buckets)),
            );
        }

        const dimensions: IDimension[] = dimsOrGen.filter(isDimension);

        return new TigerPreparedExecution(this.axios, defWithDimensions(this.definition, dimensions));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, defWithSorts(this.definition, items));
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
