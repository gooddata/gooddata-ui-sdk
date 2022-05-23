// (C) 2019-2022 GoodData Corporation

import {
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ExplainConfig,
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
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import { TigerExecutionResult } from "./executionResult";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { downloadFile } from "../../../utils/downloadFile";

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

    public async explain({ explainType }: ExplainConfig): Promise<void> {
        if (this.definition) {
            this.authCall((client) =>
                client.explain
                    .explainAFM(
                        {
                            workspaceId: this.definition.workspace,
                            afmExecution: toAfmExecution(this.definition),
                            explainType,
                        },
                        {
                            responseType: "blob",
                        },
                    )
                    .then((response) => {
                        downloadFile(explainType ? `${explainType}.json` : "explainAfm.zip", response.data);
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.warn(error);
                    }),
            );
        }
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

function checkDefIsExecutable(_def: IExecutionDefinition): void {
    return;
}
