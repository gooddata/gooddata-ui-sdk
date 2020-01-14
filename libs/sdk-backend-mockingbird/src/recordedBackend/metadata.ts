// (C) 2019-2020 GoodData Corporation

import {
    IInsightQueryOptions,
    IWorkspaceMetadata,
    NotSupported,
    IInsightQueryResult,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IVisualizationClass,
    IMeasureExpressionToken,
    IAttributeDisplayForm,
    IInsightDefinition,
    isUriRef,
    ObjRef,
} from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";

export class RecordedMetadata implements IWorkspaceMetadata {
    constructor(private readonly recordings: RecordingIndex) {}

    public getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayForm> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        if (isUriRef(ref)) {
            return Promise.reject(
                new UnexpectedResponseError("Identifying displayForm by uri is not supported yet", 400, {}),
            );
        }

        const recording = this.recordings.metadata.displayForms[
            "df_" + identifierToRecording(ref.identifier)
        ];

        if (!recording) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${ref.identifier}`, 404, {}),
            );
        }

        return Promise.resolve(recording.obj);
    }

    //
    //  not implemented down from here
    //

    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }

    public updateInsight(_: IInsight): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public getInsight(_: ObjRef): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public getInsights(_?: IInsightQueryOptions): Promise<IInsightQueryResult> {
        throw new NotSupported("not supported");
    }

    public createInsight(_: IInsightDefinition): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public deleteInsight(_: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClass(_: ObjRef): Promise<IVisualizationClass> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClasses(): Promise<IVisualizationClass[]> {
        throw new NotSupported("not supported");
    }
}
