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
} from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";

export class RecordedMetadata implements IWorkspaceMetadata {
    constructor(private readonly recordings: RecordingIndex) {}

    public getAttributeDisplayForm(id: string): Promise<IAttributeDisplayForm> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        const recording = this.recordings.metadata.displayForms["df_" + identifierToRecording(id)];

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError(`No element recordings for df ${id}`, 404, {}));
        }

        return Promise.resolve(recording.obj);
    }

    //
    //  not implemented down from here
    //

    public getMeasureExpressionTokens(_: string): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }

    public updateInsight(_: IInsight): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public getInsight(_: string): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public getInsights(_?: IInsightQueryOptions): Promise<IInsightQueryResult> {
        throw new NotSupported("not supported");
    }

    public createInsight(_: IInsightDefinition): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    public deleteInsight(_: string): Promise<void> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClass(_: string): Promise<IVisualizationClass> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClasses(): Promise<IVisualizationClass[]> {
        throw new NotSupported("not supported");
    }
}
