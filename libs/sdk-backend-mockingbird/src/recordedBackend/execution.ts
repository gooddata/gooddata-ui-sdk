// (C) 2019-2020 GoodData Corporation

import {
    AbstractExecutionFactory,
    DataValue,
    DataViewFacade,
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
import invariant from "ts-invariant";
import { ExecutionRecording, RecordingIndex } from "./types";

//
//
//

const DataViewPrefix = "dataView_";

/**
 * @internal
 */
export const DataViewAll = `${DataViewPrefix}all`;

/**
 * @internal
 */
export const dataViewWindow = (offset: number[], size: number[]) =>
    `${DataViewPrefix}${dataViewWindowId(offset, size)}`;

const dataViewWindowId = (offset: number[], size: number[]) => `o${offset.join("_")}s${size.join("_")}`;

/**
 * @internal
 */
export const DataViewFirstPage = dataViewWindow([0, 0], [100, 1000]);

//
//
//

/**
 * @internal
 */
export class RecordedExecutionFactory extends AbstractExecutionFactory {
    constructor(private readonly recordings: RecordingIndex, workspace: string) {
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
    recordings: RecordingIndex = {},
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

        this._fp = `${defFingerprint(this.definition)}/dataView/${this.offset.join(",")}_${this.count.join(
            ",",
        )}`;
    }

    public equals = (other: IDataView): boolean => {
        return this.fingerprint() === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fp;
    };
}

//
//
//

/**
 * Creates a new data view facade for the provided recording. If the recording contains multiple sets of dataViews
 * (e.g. for different windows etc), then it is possible to provide dataViewId to look up the particular view. By default,
 * the data view with all data is wrapped in the facade.
 *
 * @remarks see {@link dataViewWindow}
 *
 * @param recording - recording (as obtained from the index, typically using the Scenario mapping)
 * @param dataViewId - optionally identifier of the data view; defaults to view with all data
 * @internal
 */
export function recordedDataView(
    recording: ExecutionRecording,
    dataViewId: string = DataViewAll,
): DataViewFacade {
    const definition = recording.definition;
    const factory = new RecordedExecutionFactory({}, "testWorkspace");
    const result = new RecordedExecutionResult(definition, factory, recording);
    const data = recording[dataViewId];

    invariant(data, `data for view ${dataViewId} could not be found in the recording`);

    const dataView = new RecordedDataView(result, definition, data);

    return new DataViewFacade(dataView);
}
