// (C) 2019-2025 GoodData Corporation

import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";
import values from "lodash/values.js";

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    IInsightReferences,
    IInsightReferencing,
    IInsightsQuery,
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IWorkspaceInsightsService,
    InsightOrdering,
    NotSupported,
    SupportedInsightReferenceTypes,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    IFilter,
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    ObjRef,
    idRef,
    insightFilters,
    insightId,
    insightSetFilters,
    insightTags,
    insightTitle,
    isIdentifierRef,
    isUriRef,
    mergeFilters,
    uriRef,
    visClassId,
    visClassUri,
} from "@gooddata/sdk-model";

import { InsightRecording, RecordedRefType, RecordingIndex } from "./types.js";
import { identifierToRecording } from "./utils.js";

let adHocInsightCounter = 1;

/**
 * Note: the impl always makes / gives clones of recorded insights to prevent mutable operations
 * impacting the recordings and thus violate client-server interaction integrity (client mutates, server
 * suddenly starts returning modified data for everyone)
 *
 * @internal
 */
export class RecordedInsights implements IWorkspaceInsightsService {
    private readonly insights: { [id: string]: InsightRecording };
    private readonly visClasses: IVisualizationClass[];

    constructor(
        recordings: RecordingIndex,
        private readonly insightRefType: RecordedRefType,
    ) {
        this.insights = recordings.metadata?.insights ?? {};
        this.visClasses = recordings.metadata?.visClasses?.items ?? [];
    }

    public async createInsight(def: IInsightDefinition): Promise<IInsight> {
        const newId = `adHocInsight_${adHocInsightCounter++}`;
        const ref = this.createRef(newId, newId);
        const newInsight = { insight: { identifier: newId, uri: newId, ref, ...cloneDeep(def.insight) } };
        const recordingId = recId(newId);

        this.insights[recordingId] = { obj: newInsight };

        return newInsight;
    }

    public async getInsight(ref: ObjRef): Promise<IInsight> {
        if (isEmpty(this.insights)) {
            throw new UnexpectedResponseError("No insight recordings", 404, {});
        }

        /*
         * recorded backend treats both identifier and URI as ID; the value will be used to look up
         * insight in the recording index
         */
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        const recordingId = recId(identifierToRecording(id));
        const recording = this.insights[recordingId];

        if (!recording) {
            throw new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {});
        }

        return this.createInsightWithRef(recording.obj);
    }

    public async getInsights(query?: IInsightsQueryOptions): Promise<IInsightsQueryResult> {
        const { limit, offset, orderBy } = query ?? {};

        if (isEmpty(this.insights)) {
            return new InMemoryPaging<IInsight>([], limit, offset);
        }

        const insights = values(this.insights).map((rec) => this.createInsightWithRef(rec.obj));

        if (orderBy) {
            insights.sort(comparator(orderBy));
        }

        return new InMemoryPaging<IInsight>(insights, limit, offset);
    }

    public getInsightsQuery(): IInsightsQuery {
        throw new NotSupported("not supported");
    }

    public async updateInsight(insight: IInsight): Promise<IInsight> {
        const id = insightId(insight);
        const recordingId = recId(id);
        const existingRecording = this.insights[recordingId];

        if (!existingRecording) {
            throw new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {});
        }

        existingRecording.obj = cloneDeep(insight);

        return existingRecording.obj;
    }

    public async deleteInsight(ref: ObjRef): Promise<void> {
        const id = isIdentifierRef(ref) ? ref.identifier : ref.uri;
        const recordingId = recId(id);

        if (!this.insights[recordingId]) {
            throw new UnexpectedResponseError(`No insight with ID: ${id}`, 404, {});
        }

        delete this.insights[recordingId];
    }

    public async getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass> {
        return isUriRef(ref)
            ? this.getVisualizationClassByUri(ref.uri)
            : this.getVisualizationClassById(ref.identifier);
    }

    public async getVisualizationClasses(): Promise<IVisualizationClass[]> {
        return this.visClasses;
    }

    public getInsightReferencedObjects = async (
        _insight: IInsight,
        _types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences> => {
        return {};
    };

    public getInsightReferencingObjects = async (_ref: ObjRef): Promise<IInsightReferencing> => {
        return {};
    };

    public getInsightWithAddedFilters = async <T extends IInsightDefinition>(
        insight: T,
        filters: IFilter[],
    ): Promise<T> => {
        if (!filters.length) {
            return insight;
        }

        // we assume that all the filters already use idRefs exclusively
        const mergedFilters = mergeFilters(insightFilters(insight), filters);

        return insightSetFilters(insight, mergedFilters);
    };

    async getInsightWithCatalogItems(ref: ObjRef): Promise<{
        insight: IInsight;
        catalogItems: Array<ICatalogFact | ICatalogMeasure | ICatalogAttribute>;
    }> {
        const insight = await this.getInsight(ref);

        return {
            insight,
            catalogItems: [],
        };
    }

    private createInsightWithRef(obj: IInsight): IInsight {
        return {
            insight: {
                ...cloneDeep(obj.insight),
                ref: this.createRef(obj.insight.uri, obj.insight.identifier),
                tags: insightTags(obj),
            },
        };
    }

    private createRef(uri: string, id: string): ObjRef {
        return this.insightRefType === "uri" ? uriRef(uri) : idRef(id, "insight");
    }

    private async getVisualizationClassByUri(uri: string): Promise<IVisualizationClass> {
        const result = this.visClasses.find((visClass) => visClassUri(visClass) === uri);

        if (!result) {
            throw new UnexpectedResponseError(`No visClass with URI: ${uri}`, 404, {});
        }

        return result;
    }

    private async getVisualizationClassById(id: string): Promise<IVisualizationClass> {
        const result = this.visClasses.find((visClass) => visClassId(visClass) === id);

        if (!result) {
            throw new UnexpectedResponseError(`No visClass with ID: ${id}`, 404, {});
        }

        return result;
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
     * note: ID comparator is used for both orderBy 'id' and 'updated'. That is because 'updated' is not yet
     * part of the IInsight so there's nothing to sort by.
     */
    return idComparator;
}

function recId(forId: string): string {
    return `i_${identifierToRecording(forId)}`;
}
