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
import { RecordedInsights } from "./insights";
import { RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";

/**
 * @internal
 */
export class RecordedMetadata implements IWorkspaceMetadata {
    private insights: RecordedInsights;

    constructor(private readonly recordings: RecordingIndex) {
        this.insights = new RecordedInsights(recordings);
    }

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
    // insights services.. all methods delegate to stand-alone class
    //

    public updateInsight(insight: IInsight): Promise<IInsight> {
        return this.insights.updateInsight(insight);
    }

    public getInsight(ref: ObjRef): Promise<IInsight> {
        return this.insights.getInsight(ref);
    }

    public getInsights(query?: IInsightQueryOptions): Promise<IInsightQueryResult> {
        return this.insights.getInsights(query);
    }

    public createInsight(def: IInsightDefinition): Promise<IInsight> {
        return this.insights.createInsight(def);
    }

    public deleteInsight(ref: ObjRef): Promise<void> {
        return this.insights.deleteInsight(ref);
    }

    //
    //  not implemented down from here
    //

    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClass(_: ObjRef): Promise<IVisualizationClass> {
        throw new NotSupported("not supported");
    }

    public getVisualizationClasses(): Promise<IVisualizationClass[]> {
        throw new NotSupported("not supported");
    }
}
