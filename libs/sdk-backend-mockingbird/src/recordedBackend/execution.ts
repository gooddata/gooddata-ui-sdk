// (C) 2019 GoodData Corporation

import {
    AbstractExecutionFactory,
    DataValue,
    IDataView,
    IDimensionDescriptor,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultHeader,
    NoDataError,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    IFilter,
    SortItem,
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

const DataViewPrefix = "dataView_";
const DataViewAll = `${DataViewPrefix}all`;
const dataViewWindowId = (offset: number[], size: number[]) => `o${offset.join("_")}s${size.join("_")}`;

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
        const allData = this.recording[DataViewAll];

        if (!allData) {
            return Promise.reject(new NoDataError("there is no execution recording that contains all data"));
        }

        return Promise.resolve(new RecordedDataView(this, this.definition, allData));
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        const windowDataId = `${DataViewPrefix}${dataViewWindowId(offset, size)}`;
        const windowData = this.recording[windowDataId];

        if (!windowData) {
            return Promise.reject(new NoDataError("there is no execution recording for requested window"));
        }

        return Promise.resolve(new RecordedDataView(this, this.definition, windowData));
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
