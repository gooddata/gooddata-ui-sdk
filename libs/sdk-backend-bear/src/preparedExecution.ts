// (C) 2019 GoodData Corporation

import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    ExecutionError,
    IExecutionDefinition,
    IExecutionResult,
    IPreparedExecution,
    defaultDimensionsGenerator,
} from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import { IDimension, SortItem } from "@gooddata/sdk-model";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { BearExecutionResult } from "./executionResult";
import { toAfmExecution } from "./toAfm/toAfmResultSpec";

export class BearPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;
    private _fingerprint: string | undefined;

    constructor(private readonly authSdk: AuthenticatedSdkProvider, def: IExecutionDefinition) {
        this.definition = def;

        if (isEmpty(this.definition.dimensions)) {
            this.definition = {
                ...this.definition,
                dimensions: defaultDimensionsGenerator(this.definition),
            };
        }
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
        return new BearPreparedExecution(this.authSdk, defWithDimensions(this.definition, dimsOrGen));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return new BearPreparedExecution(this.authSdk, defWithSorting(this.definition, items));
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
