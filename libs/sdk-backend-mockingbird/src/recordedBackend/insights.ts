// (C) 2019-2020 GoodData Corporation

import {
    IInsightQueryOptions,
    IInsightQueryResult,
    InsightOrdering,
    IPagedResource,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    insightId,
    insightTitle,
    isIdentifierRef,
    ObjRef,
} from "@gooddata/sdk-model";
import { InsightRecording, RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";
import isEmpty = require("lodash/isEmpty");

let adHocInsightCounter = 1;

export class RecordedInsights {
    private readonly insights: { [id: string]: InsightRecording };

    constructor(recordings: RecordingIndex) {
        this.insights = recordings.metadata?.insights ?? {};
    }

    public createInsight(def: IInsightDefinition): Promise<IInsight> {
        const newId = `adHocInsight_${adHocInsightCounter++}`;
        const newInsight = { insight: { identifier: newId, ...def.insight } };

        this.insights[newId] = { obj: newInsight };

        return Promise.resolve(newInsight);
    }

    public getInsight(ref: ObjRef): Promise<IInsight> {
        if (isEmpty(this.insights)) {
            return Promise.reject(new UnexpectedResponseError("No insight recordings", 404, {}));
        }

        /*
         * recorded backend treats both identifier and URI as ID; the value will be used to look up
         * insight in the recording index
         */
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        const recordingId = `i_${identifierToRecording(id)}`;
        const recording = this.insights[recordingId];

        if (!recording) {
            return Promise.reject(new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {}));
        }

        return Promise.resolve(recording.obj);
    }

    public getInsights(query?: IInsightQueryOptions): Promise<IInsightQueryResult> {
        const { limit = 50, offset = 0, orderBy } = query ?? {};

        if (isEmpty(this.insights)) {
            return Promise.resolve(new PagedInsightsResult([], limit, offset));
        }

        const insights = Object.values(this.insights).map(rec => rec.obj);

        if (orderBy) {
            insights.sort(comparator(orderBy));
        }

        return Promise.resolve(new PagedInsightsResult(insights, limit, offset));
    }

    public updateInsight(insight: IInsight): Promise<IInsight> {
        const id = insightId(insight);
        const existingRecording = this.insights[id];

        if (!existingRecording) {
            return Promise.reject(new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {}));
        }

        existingRecording.obj = insight;

        return Promise.resolve(insight);
    }

    public deleteInsight(ref: ObjRef): Promise<void> {
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;

        if (!this.insights[id]) {
            return Promise.reject(new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {}));
        }

        delete this.insights[id];

        return Promise.resolve();
    }
}

type Comparator = (a: IInsight, b: IInsight) => number;

const titleComparator: Comparator = (a, b): number => {
    return insightTitle(a).localeCompare(insightTitle(b));
};

const idComparator: Comparator = (a, b): number => {
    return insightId(a).localeCompare(insightId(b));
};

function comparator(orderBy: InsightOrdering): Comparator {
    if (orderBy === "title") {
        return titleComparator;
    }

    /*
     * note: ID comparator is used for both orderBy 'id' and 'updated'. simply because 'updated' is not yet
     * part of the IInsight.
     */
    return idComparator;
}

class PagedInsightsResult implements IInsightQueryResult {
    public readonly items: IInsight[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(private readonly all: IInsight[], limit: number, offset: number) {
        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = all.slice(offset, offset + limit);

        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, all.length);
        // limit is capped to size of current page

        this.limit = Math.max(limit, this.items.length);

        this.totalCount = all.length;
    }

    public next(): Promise<IPagedResource<IInsight>> {
        if (this.items.length === 0) {
            return Promise.resolve(this);
        }

        return Promise.resolve(
            new PagedInsightsResult(this.all, this.limit, this.offset + this.items.length),
        );
    }
}
