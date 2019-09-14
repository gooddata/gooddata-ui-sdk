// (C) 2019 GoodData Corporation

import {
    DimensionGenerator,
    ExecutionError,
    IExecutionDefinition,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { IDimension, isDimension, SortItem } from "@gooddata/sdk-model";
import { defFingerprint, defWithDimensions, defWithSorts } from "./executionDefinition";
import isEmpty from "lodash/isEmpty";
import { BearExecutionResult } from "./executionResult";
import { toAfmExecution } from "./toAfm/toAfmResultSpec";

export class BearPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;
    private _fingerprint: string | undefined;

    constructor(private readonly authSdk: AuthenticatedSdkProvider, def: IExecutionDefinition) {
        this.definition = def;
    }

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const sdk = await this.authSdk();
        const afmExecution = toAfmExecution(this.definition);

        return sdk.execution
            .getExecutionResponse(this.definition.workspace, afmExecution)
            .then(response => {
                return new BearExecutionResult(this.authSdk, this.definition, response);
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
            return new BearPreparedExecution(
                this.authSdk,
                defWithDimensions(this.definition, maybeGenerator(this.definition.buckets)),
            );
        }

        const dimensions: IDimension[] = dimsOrGen.filter(isDimension);

        return new BearPreparedExecution(this.authSdk, defWithDimensions(this.definition, dimensions));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return new BearPreparedExecution(this.authSdk, defWithSorts(this.definition, items));
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
