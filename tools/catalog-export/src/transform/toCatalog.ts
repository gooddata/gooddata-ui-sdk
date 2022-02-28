// (C) 2007-2022 GoodData Corporation
import { WorkspaceMetadata, Attribute } from "../base/types";
import { createUniqueName } from "./titles";
import cloneDeep from "lodash/cloneDeep";
import findKey from "lodash/findKey";
import forOwn from "lodash/forOwn";
import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
/*
 * This transformation takes project metadata and creates an object that matches the required input of CatalogHelper.
 */

//
// Types - copied from CatalogHelper in sdk-ui; don't want to import them from there as that would mean they
//  be part of public API and i'm unsure whether that's a good idea
//

interface IIdentifierWithTags {
    identifier: string;
    tags: string;
}

interface IDisplayForms {
    [key: string]: IIdentifierWithTags;
}

interface IAttrItem {
    identifier: string;
    tags: string;
    displayForms: IDisplayForms;
    defaultDisplayForm: IIdentifierWithTags;
}

interface IAttrs {
    [key: string]: IAttrItem;
}

interface IDataSet {
    identifier: string;
    tags: string;
    attributes: IAttrs;
}

interface ICatalog {
    projectId: string;
    measures?: TitleToItemMap;
    visualizations: TitleToItemMap;
    attributes: IAttrs;
    dateDataSets: TitleToDataSet;
    dashboards: TitleToItemMap;
}

type TitleToDataSet = { [key: string]: IDataSet };
type TitleToItemMap = { [key: string]: IIdentifierWithTags };

//
// transformation functions
//

function createMeasures(projectMeta: WorkspaceMetadata): TitleToItemMap {
    const newMapping: TitleToItemMap = {};

    projectMeta.catalog.metrics.forEach((metric) => {
        const { title, identifier, tags } = metric.metric.meta;
        const uniqueTitle = createUniqueName(title, newMapping);
        newMapping[uniqueTitle] = {
            identifier,
            tags,
        };
    });

    projectMeta.catalog.facts.forEach((fact) => {
        const { title, identifier, tags } = fact.fact.meta;
        const uniqueTitle = createUniqueName(title, newMapping);
        newMapping[uniqueTitle] = { identifier, tags };
    });

    return newMapping;
}

function createAttributes(attributes: Attribute[]): IAttrs {
    const newAttrs: IAttrs = {};

    attributes.forEach((attr) => {
        const uniqueAttrTitle = createUniqueName(attr.attribute.meta.title, newAttrs);
        const newDisplayForms: IDisplayForms = {};
        let firstDisplayForm: IIdentifierWithTags | undefined;

        attr.attribute.content.displayForms.forEach((df) => {
            const { title, identifier, tags } = df.meta;
            const uniqueDfTitle = createUniqueName(title, newDisplayForms);
            const newDisplayForm: IIdentifierWithTags = {
                identifier,
                tags,
            };

            if (!firstDisplayForm) {
                firstDisplayForm = newDisplayForm;
            }

            newDisplayForms[uniqueDfTitle] = newDisplayForm;
        });

        if (firstDisplayForm) {
            const { identifier, tags } = attr.attribute.meta;
            const newAttr: IAttrItem = {
                identifier,
                tags,
                defaultDisplayForm: firstDisplayForm,
                displayForms: newDisplayForms,
            };

            newAttrs[uniqueAttrTitle] = newAttr;
        }
    });

    return newAttrs;
}

function createCatalogAttributes(projectMeta: WorkspaceMetadata): IAttrs {
    return createAttributes(projectMeta.catalog.attributes);
}

function createDateDatasets(projectMeta: WorkspaceMetadata): TitleToDataSet {
    const newDataSets: TitleToDataSet = {};

    projectMeta.dateDataSets.forEach((dd) => {
        const { title, identifier, tags } = dd.dateDataSet.meta;
        const uniqueDsTitle = createUniqueName(title, newDataSets);
        const attributes: IAttrs = createAttributes(dd.dateDataSet.content.attributes);
        const newDataSet: IDataSet = {
            identifier,
            tags,
            attributes,
        };

        newDataSets[uniqueDsTitle] = newDataSet;
    });

    return newDataSets;
}

function createVisualizations(projectMeta: WorkspaceMetadata): TitleToItemMap {
    const newMapping: TitleToItemMap = {};

    projectMeta.insights.forEach((insight) => {
        const { title, identifier, tags } = insight;
        const uniqueTitle = createUniqueName(title, newMapping);
        newMapping[uniqueTitle] = { identifier, tags };
    });

    return newMapping;
}

function createDashboards(projectMeta: WorkspaceMetadata): TitleToItemMap {
    const newMapping: TitleToItemMap = {};

    projectMeta.analyticalDashboards.forEach((dashboard) => {
        const { title, identifier, tags } = dashboard;
        const uniqueTitle = createUniqueName(title, newMapping);
        newMapping[uniqueTitle] = { identifier, tags };
    });

    return newMapping;
}

/**
 * Merges new and existing catalog by item identifiers. The logic is as follows:
 *
 * - If the item with same identifier is in the existing catalog, the title from the existing
 *   catalog SHOULD be retained
 *
 * - The title for existing item will be retained unless it conflicts with title for another
 *   an item in the new catalog. In that case item from existing catalog will have the title
 *   changed, sequence number will be added
 *
 * - Merging is done recursively if item is an object with predefined keys (df, attributes) ⇒
 *   this is thus currently triggered for date data sets and attributes.
 *
 * @param newCatalog - newly generated catalog
 * @param existingCatalog - existing catalog contents (may be empty)
 * @param mergePaths - top level properties to merge on
 * @param subItemKeys - second level properties to merge on recursively
 */
function mergeData(
    newCatalog: any,
    existingCatalog: any,
    mergePaths = ["visualizations", "measures", "attributes", "dateDataSets"],
    subItemKeys = ["displayForms", "attributes"],
): ICatalog {
    const result = cloneDeep(newCatalog);

    mergePaths.forEach((path) => {
        set(result, path, {});
        const newItems = newCatalog?.[path];
        const existingItems = existingCatalog?.[path];

        forOwn(newItems, (newItem, newItemKey) => {
            const existingTitle = findKey(existingItems, (item) => item.identifier === newItem.identifier);
            const resolvedTitle = existingTitle ? existingTitle : newItemKey;
            const nonConflictingTitle = createUniqueName(resolvedTitle, result?.[path]);

            if (resolvedTitle !== nonConflictingTitle) {
                console.warn("resolving duplicate key", resolvedTitle, "into", nonConflictingTitle); // eslint-disable-line no-console
            }

            let resultItem = newItem;
            if (existingTitle) {
                subItemKeys.forEach((subItemKey) => {
                    // eslint-disable-next-line no-prototype-builtins
                    if (resultItem.hasOwnProperty(subItemKey)) {
                        resultItem = mergeData(resultItem, existingItems[existingTitle], [subItemKey]);
                    }
                });
            }

            set(result, [path, nonConflictingTitle], resultItem);
        });
    });

    return result;
}

/**
 * Transforms project metadata into the sdk-ui catalog format. The catalog format can be serialized
 * and later ingested by the CatalogHelper in the sdk-ui.
 *
 * @param projectMeta - project metadata to work with
 * @param existingCatalog - existing catalog structure to merge with
 */
export function transformToCatalog(projectMeta: WorkspaceMetadata, existingCatalog?: object): any {
    const measures = createMeasures(projectMeta);
    const measuresProp = !isEmpty(measures) ? { measures } : {};
    const attributes = createCatalogAttributes(projectMeta);
    const dateDataSets = createDateDatasets(projectMeta);
    const visualizations = createVisualizations(projectMeta);
    const dashboards = createDashboards(projectMeta);

    const newCatalog: ICatalog = {
        projectId: projectMeta.workspaceId,
        ...measuresProp,
        attributes,
        visualizations,
        dateDataSets,
        dashboards,
    };

    if (existingCatalog) {
        return mergeData(newCatalog, existingCatalog);
    }

    return newCatalog;
}
