// (C) 2026 GoodData Corporation

import {
    type ILocalizationMissingObject,
    type ILocalizationMissingText,
    type LocalizationTextKind,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { type ObjectType } from "@gooddata/sdk-model";

import { isTigerType, tigerIdTypeToObjectType } from "../../types/refTypeMapping.js";

const TEXT_KINDS: Record<string, LocalizationTextKind> = {
    title: "title",
    description: "description",
    tags: "tags",
    "free-form": "freeForm",
};

const SAME_NAME_OBJECT_TYPES = new Map<string, ObjectType>([["exportDefinition", "exportDefinition"]]);

function toObjectType(type: string): ObjectType | undefined {
    return isTigerType(type) ? tigerIdTypeToObjectType[type] : SAME_NAME_OBJECT_TYPES.get(type);
}

function childrenNamed(element: Element, name: string): Element[] {
    return Array.from(element.children).filter((child) => child.localName === name);
}

function sourceText(segment: Element): string {
    return childrenNamed(segment, "source")[0]?.textContent?.trim() ?? "";
}

function isMissing(segment: Element): boolean {
    return sourceText(segment) !== "" && childrenNamed(segment, "target").length === 0;
}

function missingObject(objectGroup: Element, type: string): ILocalizationMissingObject | undefined {
    const groupId = objectGroup.getAttribute("id") ?? "";
    const id = groupId.startsWith(`${type}.`) ? groupId.slice(type.length + 1) : groupId;
    let title = "";
    const missing: ILocalizationMissingText[] = [];
    for (const unit of childrenNamed(objectGroup, "unit")) {
        const kind = TEXT_KINDS[(unit.getAttribute("id") ?? "").slice(groupId.length + 1)];
        const segments = childrenNamed(unit, "segment");
        if (kind === "title") {
            title = segments[0] ? sourceText(segments[0]) : "";
        }
        const count = segments.filter(isMissing).length;
        if (kind && count > 0) {
            missing.push({ text: kind, count });
        }
    }
    return missing.length > 0
        ? {
              type: toObjectType(type),
              id,
              title: title || id,
              missing,
          }
        : undefined;
}

export function missingTranslationsFromXliff(xliff: string): ILocalizationMissingObject[] {
    if (typeof DOMParser === "undefined") {
        throw new UnexpectedError("Reading translations needs a browser environment.");
    }
    const document = new DOMParser().parseFromString(
        xliff.replace(/^\s*<\?xml[^>]*\?>/, ""),
        "application/xml",
    );
    if (document.getElementsByTagName("parsererror").length > 0) {
        throw new UnexpectedError("The translations could not be read.");
    }
    return Array.from(document.documentElement.children)
        .filter((child) => child.localName === "file")
        .flatMap((file) => childrenNamed(file, "group"))
        .flatMap((typeGroup) => {
            const type = typeGroup.getAttribute("id") ?? "";
            return childrenNamed(typeGroup, "group").flatMap((objectGroup) => {
                const object = missingObject(objectGroup, type);
                return object ? [object] : [];
            });
        });
}
