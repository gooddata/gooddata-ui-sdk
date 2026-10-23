// (C) 2021-2026 GoodData Corporation

import { type Hover, MarkupKind, type Position } from "vscode-languageserver";

import { type ObjRef } from "@gooddata/sdk-model";

import { findAllObjects } from "./findObjects.js";
import {
    type ITigerMetadataObject,
    type LdmObjects,
    isITigerMetric,
    isITigerParameter,
} from "./metadata/model.js";
import { parameterSummary } from "./metadata/parameters.js";
import { MaqlMetric } from "./parseMaql.js";

export type ObjectContent = {
    id: string;
    ref: ObjRef;
    title: string;
    description: string;
    maql: string;
    format: string;
    isLocked?: boolean;
};
export type HoverWithData = Hover & {
    object: ObjectContent | null;
};
export function hover(query: string, position: Position, ldmObjects?: LdmObjects): HoverWithData | null {
    if (!ldmObjects) return null;
    const metric = new MaqlMetric(query);
    const objects = findAllObjects(metric);
    const objAtPosition = objects.find((obj) => {
        const range = obj.range.toRange();
        return positionLesserOrEqual(range.start, position) && positionLesserOrEqual(position, range.end);
    });
    if (!objAtPosition) return null;
    const obj = ldmObjects.findObject(objAtPosition);
    if (!obj || (!isITigerMetric(obj) && !isITigerParameter(obj))) return null;
    return {
        contents: {
            kind: MarkupKind.Markdown,
            value: markdownObjectContent(obj),
        },
        object: objectContent(obj),
        range: objAtPosition.range.toRange(),
    };
}

function positionLesserOrEqual(p1: Position, p2: Position): boolean {
    return p1.line < p2.line || (p1.line === p2.line && p1.character <= p2.character);
}

function markdownObjectContent(object: ITigerMetadataObject): string {
    const lines = [];
    lines.push(`## ${object.title}`);
    if (object.description && object.description.length > 0) {
        lines.push(object.description);
    }
    if (isITigerMetric(object)) {
        lines.push("```maql", object.expression, "```", `format: ${object.format}`);
    }
    if (isITigerParameter(object)) {
        lines.push(`Parameter (${parameterSummary(object.definition)})`);
    }
    return lines.join("\n");
}

function objectContent(object: ITigerMetadataObject): ObjectContent | null {
    if (isITigerMetric(object)) {
        return {
            id: object.id,
            ref: object.ref,
            isLocked: object.isLocked,
            title: object.title,
            description: object.description || "",
            maql: object.expression,
            format: object.format || "",
        };
    }

    return null;
}
