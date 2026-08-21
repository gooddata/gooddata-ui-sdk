// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IChatConversationToolCallContent,
    type IChatConversationToolResultContent,
    isChatConversationToolCallContent,
    isChatConversationToolResultContent,
} from "@gooddata/sdk-backend-spi";

import { type TextContentObject } from "../../model.js";
import { type IChatMessagesGroup } from "../utils/groupUtility.js";

type TextContentObjectWithoutTitle = Omit<TextContentObject, "title"> & { title?: string };

export function useToolsReferences(groups: IChatMessagesGroup[]): TextContentObject[] {
    return useMemo(() => {
        const references: TextContentObjectWithoutTitle[] = [];
        const mapping: Record<string, IChatConversationToolCallContent> = {};

        groups.forEach((group) => {
            group.messages.forEach((message) => {
                const cont = message.content;
                // Skip system and error messages
                if (cont.type === "error" || cont.type === "system") {
                    return;
                }
                if (isChatConversationToolCallContent(cont)) {
                    mapping[cont.callId] = cont;
                }
                if (isChatConversationToolResultContent(cont)) {
                    parseToolResults(references, mapping[cont.callId], cont);
                }
            });
        });

        return references.map((obj) => ({ ...obj, title: obj.title ?? obj.id }));
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
    definition?: string | null;
    dataset_id?: string | null;
    dataset_title?: string | null;
};

type DataMetricsItem = {
    id: string;
    type: string;
    attributes?: {
        title?: string;
        description?: string;
    };
};

type DashboardContext = {
    id: string;
    title: string;
    active_tab_id: string;
    active_filters: any[];
    widgets: Widget[];
};

type Widget = InsightWidget | VisualizationSwitcherWidget;

type InsightWidget = {
    widget_type: "insight";
    widget_id: string;
    title: string;
    visualization_id: string;
    result_id: string;
};

type VisualizationSwitcherWidget = {
    widget_type: "visualization_switcher";
    widget_id: string;
    title: string;
    active_visualization_id: string;
    visualization_ids: string[] | undefined;
    visualizations:
        | {
              title: string;
              visualization_id: string;
              result_id?: string;
          }[]
        | undefined;
    result_id: string;
};

function parseToolResults(
    references: TextContentObjectWithoutTitle[],
    call: IChatConversationToolCallContent,
    cont: IChatConversationToolResultContent,
) {
    // Is not an objects, skip it
    if (typeof cont.result === "string") {
        return;
    }

    //NOTE: There can be basically anything
    const res = (cont.result ?? {}) as any;

    //.parsed_objects
    if (Array.isArray(res.parsed_objects)) {
        const created: TextContentObjectWithoutTitle[] = res.parsed_objects.map(
            (obj: ParsedObjectItem): TextContentObjectWithoutTitle => ({
                type: obj.object_type as TextContentObject["type"],
                id: obj.object_id,
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }

    //.objects
    if (Array.isArray(res.objects)) {
        const created: TextContentObjectWithoutTitle[] = res.objects.map(
            (obj: ObjectItem): TextContentObjectWithoutTitle => ({
                type: (obj.final_type ?? obj.type) as TextContentObject["type"],
                id: obj.id,
                title: obj.title,
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }

    //.res.data.metrics
    if (Array.isArray(res.data?.metrics)) {
        const created: TextContentObjectWithoutTitle[] = res.data.metrics.map(
            (obj: DataMetricsItem): TextContentObjectWithoutTitle => ({
                type: obj.type as TextContentObject["type"],
                id: obj.id,
                title: obj.attributes?.title,
            }),
        );
        mergeReferenceObjectInfos(references, created);
    }

    //.dashboard in "get_dashboard_context"
    if (call?.name === "get_dashboard_context" && res.dashboard) {
        const dash = res.dashboard as DashboardContext;

        if (dash.id) {
            mergeReferenceObjectInfos(references, [
                {
                    type: "dashboard",
                    id: dash.id,
                    title: dash.title,
                },
            ]);

            dash.widgets?.forEach((widget) => {
                switch (widget.widget_type) {
                    case "visualization_switcher": {
                        const created: TextContentObjectWithoutTitle[] = [];
                        created.push({
                            type: "visualization",
                            id: widget.active_visualization_id,
                            title: widget.title,
                        });
                        widget.visualization_ids?.forEach((id) => {
                            created.push({
                                type: "visualization",
                                id,
                            });
                        });
                        widget.visualizations?.forEach(({ visualization_id, title }) => {
                            created.push({
                                type: "visualization",
                                id: visualization_id,
                                title,
                            });
                        });
                        mergeReferenceObjectInfos(references, created);
                        break;
                    }
                    case "insight": {
                        mergeReferenceObjectInfos(references, [
                            {
                                type: "visualization",
                                id: widget.visualization_id,
                                title: widget.title,
                            },
                        ]);
                        break;
                    }
                }
            });
        }
    }

    //.parent in "get_object_with_children"
    if (call?.name === "get_object_with_children" && res.parent) {
        const par = res.parent as ObjectItem;
        mergeReferenceObjectInfos(references, [
            {
                type: (par.final_type ?? par.type) as TextContentObject["type"],
                id: par.id,
                title: par.title,
            },
        ]);
    }
    //.children in "get_object_with_children"
    if (call?.name === "get_object_with_children" && res.children) {
        const children = res.children as ObjectItem[];
        mergeReferenceObjectInfos(
            references,
            children.map((child) => ({
                type: (child.final_type ?? child.type) as TextContentObject["type"],
                id: child.id,
                title: child.title,
            })),
        );
    }
}

function mergeReferenceObjectInfos(
    objects: TextContentObjectWithoutTitle[],
    created: TextContentObjectWithoutTitle[],
) {
    created.forEach((obj) => {
        const existing = objects.find((o) => o.id === obj.id && o.type === obj.type);
        if (existing) {
            existing.title = existing.title || obj.title;
        } else {
            objects.push(obj);
        }
    });
}
