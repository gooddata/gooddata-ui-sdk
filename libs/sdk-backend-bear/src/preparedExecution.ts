// (C) 2019 GoodData Corporation

import {
    DimensionGenerator,
    IExecutionDefinition,
    IExecutionResult,
    IPreparedExecution,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { IAuthenticatedSdkProvider } from "./commonTypes";
import { IDimension, SortItem, Total } from "@gooddata/sdk-model";
import { defFingerprint } from "./executionDefinition";
import { toAfmExecution } from "./toAfm";

export class BearPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;
    public readonly fingerprint: string;

    constructor(private readonly authSdk: IAuthenticatedSdkProvider, def: IExecutionDefinition) {
        this.definition = def;
        this.fingerprint = defFingerprint(def);
    }

    public async execute(): Promise<IExecutionResult> {
        checkDefIsExecutable(this.definition);

        const sdk = await this.authSdk.get();
        const afmExecution = toAfmExecution(this.definition);

        return sdk.execution.getExecutionResponse(this.definition.workspace, afmExecution).then(_ => {
            throw new NotImplemented("...");
        });
    }

    // @ts-ignore
    public withDimensions(...dimsOrGen: IDimension[] | DimensionGenerator[]): IPreparedExecution {
        return this;
    }

    // @ts-ignore
    public withSorting(...items: SortItem[]): IPreparedExecution {
        return this;
    }

    // @ts-ignore
    public withTotals(...totals: Total[]): IPreparedExecution {
        return this;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.fingerprint === other.fingerprint;
    }
}

// @ts-ignore
function checkDefIsExecutable(def: IExecutionDefinition): void {
    return;
}
