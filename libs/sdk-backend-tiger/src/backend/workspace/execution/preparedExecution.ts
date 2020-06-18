// (C) 2019-2020 GoodData Corporation

import { IExecutionFactory, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
} from "@gooddata/sdk-model";
import { TigerExecutionResult } from "./executionResult";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types";
import { TigerAuthenticatedCallGuard } from "../../../types";

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

        return this.authCall(sdk => sdk.execution.executeAfm(afmExecution)).then(response => {
            return new TigerExecutionResult(this.authCall, this.definition, response, this.dateFormatter);
        });
    }

    public withDimensions(...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithDimensions(this.definition, ...dimsOrGen));
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items));
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
