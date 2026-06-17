// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IChatConversationToolResultContent,
    isChatConversationToolResultContent,
} from "@gooddata/sdk-backend-spi";

import { type TextContentObject } from "../../model.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

export function useToolsReferences(groups: IChatMessagesGroup[]): TextContentObject[] {
    return useMemo(() => {
        const references: TextContentObject[] = [];

        groups.forEach((group) => {
            group.messages.forEach((message) => {
                const cont = message.content;
                // Skip system and error messages
                if (cont.type === "error" || cont.type === "system") {
                    return;
                }
                if (isChatConversationToolResultContent(cont)) {
                    parseToolResults(references, cont);
                }
            });
        });

        return references;
    }, [groups]);
}

type ParsedObjectItem = {
    object_id: string;
    object_type: string;
    raw_match: string;
};

type ObjectItem = {
    id: string;
    type: string;
    final_type?: string;
    title: string;
    description: string;
};

type DataMetricsItem = {
    id: string;
    type: string;
    attributes?: {
        title?: string;
        description?: string;
    };
};

function parseToolResults(references: TextContentObject[], cont: IChatConversationToolResultContent) {
    // Is not an objects, skip it
    if (typeof cont.result === "string") {
        return;
    }

    //NOTE: There can be basically anything
    const res = (cont.result ?? {}) as any;

    //.parsed_objects
    if (Array.isArray(res.parsed_objects)) {
        const created: TextContentObject[] = res.parsed_objects.map(
            (obj: ParsedObjectItem): TextContentObject => ({
                type: obj.object_type as TextContentObject["type"],
                id: obj.object_id,
                title: "",
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }

    //.objects
    if (Array.isArray(res.objects)) {
        const created: TextContentObject[] = res.objects.map(
            (obj: ObjectItem): TextContentObject => ({
                type: (obj.final_type ?? obj.type) as TextContentObject["type"],
                id: obj.id,
                title: obj.title,
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }

    //.objects
    if (Array.isArray(res.data?.metrics)) {
        const created: TextContentObject[] = res.data.metrics.map(
            (obj: DataMetricsItem): TextContentObject => ({
                type: obj.type as TextContentObject["type"],
                id: obj.id,
                title: obj.attributes?.title ?? "",
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }
}

function mergeReferenceObjectInfos(objects: TextContentObject[], created: TextContentObject[]) {
    created.forEach((obj) => {
        const existing = objects.find((o) => o.id === obj.id && o.type === obj.type);
        if (existing) {
            existing.title = existing.title || obj.title;
        } else {
            objects.push(obj);
        }
    });
}
