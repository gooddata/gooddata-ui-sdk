// (C) 2019 GoodData Corporation

import {
    AbstractExecutionFactory,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IPreparedExecution,
    NotSupported,
    IExportResult,
    IDataView,
    NotImplemented,
    IDimensionDescriptor,
    DataValue,
    IResultHeader,
    NoDataError,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    SortItem,
    IFilter,
} from "@gooddata/sdk-model";
import { ExecutionRecording, WorkspaceRecordings } from "./types";

export class RecordedExecutionFactory extends AbstractExecutionFactory {
    constructor(private readonly recordings: WorkspaceRecordings, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return recordedPreparedExecution(def, this, this.recordings);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotSupported("not yet supported");
    }
}

function recordedPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    recordings: WorkspaceRecordings = {},
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return executionFactory.forDefinition(defWithSorting(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise((resolve, reject) => {
                const recording = recordings.executions && recordings.executions["fp_" + fp];

                if (!recording) {
                    reject(new NoDataError("recording was not found"));
                } else {
                    resolve(new RecordedExecutionResult(definition, executionFactory, recording));
                }
            });
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}

class RecordedExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly _fp: string;

    constructor(
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        private readonly recording: ExecutionRecording,
    ) {
        this.dimensions = this.recording.executionResult.dimensions as IDimensionDescriptor[];
        this._fp = defFingerprint(this.definition) + "/recordedResult";
    }

    public export = (_options: IExportConfig): Promise<IExportResult> => {
        throw new NotSupported("recorded backend does not support exports");
    };

    public readAll = (): Promise<IDataView> => {
        return Promise.resolve(new RecordedDataView(this, this.definition, this.recording.dataViewAll));
    };

    public readWindow = (_offset: number[], _size: number[]): Promise<IDataView> => {
        /*
         * Support for page-able recordings needs to drop eventually. Since the executions and their results
         * can be quite complex (with the grant totals, subtotals and all this) it will be safer to actually
         * make per-page recordings and look them up.
         *
         * Paging on top of the dataViewAll may be possible but means duplication of non-trivial backend logic.
         */
        return Promise.reject(new NotImplemented("not yet implemented"));
    };

    public transform = (): IPreparedExecution => {
        return this.executionFactory.forDefinition(this.definition);
    };

    public equals = (other: IExecutionResult): boolean => {
        return this.fingerprint() === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fp;
    };
}

class RecordedDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly headerItems: IResultHeader[][][];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly totalCount: number[];
    public readonly totals: DataValue[][][];

    private readonly _fp: string;

    constructor(
        public readonly result: IExecutionResult,
        public readonly definition: IExecutionDefinition,
        recordedDataView: any,
    ) {
        this.data = recordedDataView.data;
        this.headerItems = recordedDataView.headerItems;
        this.totals = recordedDataView.totals;
        this.count = recordedDataView.count;
        this.offset = recordedDataView.offset;
        this.totalCount = recordedDataView.totalCount;

        this._fp = defFingerprint(this.definition) + "/dataView/*";
    }

    public equals = (other: IDataView): boolean => {
        return this.fingerprint() === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fp;
    };
}
