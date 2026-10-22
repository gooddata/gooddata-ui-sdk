// (C) 2026 GoodData Corporation

import {
    type FilterContextItem,
    dashboardAttributeFilterItemDisplayForm,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
} from "../../dashboard/filterContext.js";
import { type ObjRef, areObjRefsEqual, isIdentifierRef } from "../../objRef/index.js";

import { type Check, type IPublisherValidationIssueV2, joinPath } from "./checks.js";
import { type PublisherDocumentContentV2 } from "./content.js";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageTemplateDefinitionV2,
} from "./document.js";
import { isReservedPublisherEntityIdV2, reservedPublisherEntityIdPrefixV2 } from "./factory.js";
import { type PublisherLayoutNodeV2, isPublisherContainerV2 } from "./layout.js";
import { type IPublisherDocumentPageV2, type IPublisherPageBodyV2 } from "./page.js";
import { checkDocumentContent, checkEntity, checkLoadedEntity, checkPageBody } from "./structure.js";
import { type PublisherWidgetV2, isPublisherTitleWidgetV2 } from "./widget.js";

type PublisherEntityDefinitionV2 =
    | IPublisherDocumentDefinitionV2
    | IPublisherDocumentTemplateDefinitionV2
    | IPublisherPageTemplateDefinitionV2;

/**
 * Validates a page body, such as a page template's content: every key, value and node type, at most
 * one title widget, and widget ids unique in the page.
 *
 * @alpha
 */
export function validatePublisherPageBodyV2(body: unknown): IPublisherValidationIssueV2[] {
    return validate(body, {
        structure: checkPageBody,
        rules: (value: IPublisherPageBodyV2) => pageIssues(value, ""),
    });
}

/**
 * Validates the content of a document or a document template: every key, value and node type,
 * exactly one of `pages` and `sections`, page and section ids unique in the document, a `dataSet` on
 * every date filter, at most one filter per attribute display form or date dataset, and the page
 * rules on every page.
 *
 * @alpha
 */
export function validatePublisherDocumentContentV2(content: unknown): IPublisherValidationIssueV2[] {
    return validate(content, {
        structure: checkDocumentContent,
        rules: (value: PublisherDocumentContentV2) => contentIssues(value, ""),
    });
}

/**
 * Validates a document, document template or page template as it is saved: everything its content
 * validator checks, `version` `"2"`, `defaults.period` set on document templates only, and no id
 * starting with `default.`, which the backend keeps for its own defaults.
 *
 * @alpha
 */
export function validatePublisherEntityV2(entity: unknown): IPublisherValidationIssueV2[] {
    return validate(entity, {
        structure: checkEntity,
        rules: (value: PublisherEntityDefinitionV2) => [...reservedIdIssues(value), ...entityIssues(value)],
    });
}

/**
 * Validates a document, document template or page template as loaded from the backend. It reads what
 * {@link validatePublisherEntityV2} would not save but the backend stores: an empty title, and an id
 * starting with `default.`. Everything else is checked as for a save.
 *
 * @alpha
 */
export function validateLoadedPublisherEntityV2(entity: unknown): IPublisherValidationIssueV2[] {
    return validate(entity, {
        structure: checkLoadedEntity,
        rules: entityIssues,
    });
}

function validate<T>(
    value: unknown,
    { structure, rules }: { structure: Check; rules: (value: T) => IPublisherValidationIssueV2[] },
): IPublisherValidationIssueV2[] {
    const issues: IPublisherValidationIssueV2[] = [];
    structure(value, "", issues);
    // The rules read the value through its model type, which is sound only once the structure passed.
    return issues.length > 0 ? issues : rules(value as T);
}

function entityIssues(entity: PublisherEntityDefinitionV2): IPublisherValidationIssueV2[] {
    if (entity.type === "pageTemplate") {
        return pageIssues(entity.content, "content");
    }
    const issues: IPublisherValidationIssueV2[] = [];
    if (entity.type === "document" && entity.content.defaults?.period !== undefined) {
        issues.push({
            path: "content.defaults.period",
            message: "Only a document template sets a default period; a document sets its own period.",
        });
    }
    return [...issues, ...contentIssues(entity.content, "content")];
}

type WithPath<T> = [value: T, path: string];

function reservedIdIssues({ ref }: PublisherEntityDefinitionV2): IPublisherValidationIssueV2[] {
    return isIdentifierRef(ref) && isReservedPublisherEntityIdV2(ref.identifier)
        ? [
              {
                  path: "ref",
                  message: `Ids starting with "${reservedPublisherEntityIdPrefixV2}" are reserved for the backend's defaults.`,
              },
          ]
        : [];
}

function contentIssues(content: PublisherDocumentContentV2, path: string): IPublisherValidationIssueV2[] {
    const issues: IPublisherValidationIssueV2[] = [];
    const { pages, sections } = content;
    if (pages !== undefined && sections !== undefined) {
        issues.push({ path, message: "Content holds pages or sections, never both." });
    } else if (pages === undefined && sections === undefined) {
        issues.push({ path, message: "Content holds pages or sections." });
    }

    const pagesWithPaths: Array<WithPath<IPublisherDocumentPageV2>> = [
        ...(pages ?? []).map((page, i): WithPath<IPublisherDocumentPageV2> => [
            page,
            joinPath(path, `pages[${i}]`),
        ]),
        ...(sections ?? []).flatMap((section, s) =>
            section.pages.map((page, i): WithPath<IPublisherDocumentPageV2> => [
                page,
                joinPath(path, `sections[${s}].pages[${i}]`),
            ]),
        ),
    ];

    issues.push(
        ...duplicateIdIssues(
            (sections ?? []).map((section, s) => [section.id, joinPath(path, `sections[${s}].id`)]),
            "section",
        ),
        ...duplicateIdIssues(
            pagesWithPaths.map(([page, pagePath]) => [page.id, joinPath(pagePath, "id")]),
            "page",
        ),
        ...filterIssues(content.filters ?? [], joinPath(path, "filters")),
        ...pagesWithPaths.flatMap(([page, pagePath]) => pageIssues(page, pagePath)),
    );
    return issues;
}

function pageIssues(body: IPublisherPageBodyV2, path: string): IPublisherValidationIssueV2[] {
    const widgets = layoutWidgets(body.layout, joinPath(path, "layout"));
    const titlePaths = widgets
        .filter(([node]) => isPublisherTitleWidgetV2(node))
        .map(([, nodePath]) => nodePath);

    return [
        ...titlePaths.slice(1).map((titlePath) => ({
            path: titlePath,
            message: "A page holds at most one title widget.",
        })),
        ...duplicateIdIssues(
            widgets.map(([node, nodePath]) => [node.id, joinPath(nodePath, "id")]),
            "widget",
        ),
    ];
}

function layoutWidgets(node: PublisherLayoutNodeV2, path: string): Array<WithPath<PublisherWidgetV2>> {
    if (isPublisherContainerV2(node)) {
        return node.children.flatMap((child, i) => layoutWidgets(child, joinPath(path, `children[${i}]`)));
    }
    return [[node, path]];
}

function duplicateIdIssues(
    idsWithPaths: Array<WithPath<string>>,
    kind: "page" | "section" | "widget",
): IPublisherValidationIssueV2[] {
    const seen = new Set<string>();
    return idsWithPaths.flatMap(([id, path]) => {
        if (seen.has(id)) {
            return [{ path, message: `Duplicate ${kind} id "${id}".` }];
        }
        seen.add(id);
        return [];
    });
}

function filterIssues(filters: FilterContextItem[], path: string): IPublisherValidationIssueV2[] {
    const issues: IPublisherValidationIssueV2[] = [];
    const displayForms: ObjRef[] = [];
    const dataSets: ObjRef[] = [];

    filters.forEach((filter, i) => {
        const filterPath = joinPath(path, i);
        if (isDashboardAttributeFilterItem(filter)) {
            if (!addIfNew(dashboardAttributeFilterItemDisplayForm(filter), displayForms)) {
                issues.push({ path: filterPath, message: "At most one filter per attribute display form." });
            }
        } else if (isDashboardDateFilter(filter)) {
            const { dataSet } = filter.dateFilter;
            if (dataSet === undefined) {
                issues.push({ path: filterPath, message: "A document date filter names its dataSet." });
            } else if (!addIfNew(dataSet, dataSets)) {
                issues.push({ path: filterPath, message: "At most one filter per date dataset." });
            }
        }
    });
    return issues;
}

function addIfNew(target: ObjRef, seen: ObjRef[]): boolean {
    if (seen.some((ref) => areObjRefsEqual(ref, target))) {
        return false;
    }
    seen.push(target);
    return true;
}
