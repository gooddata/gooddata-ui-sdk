// (C) 2007-2019 GoodData Corporation
import { ProjectMetadata, Attribute } from "../base/types";
import { createUniqueName } from "./titles";
import { get, set, cloneDeep, findKey, forOwn, isEmpty } from "lodash";
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
}

type TitleToDataSet = { [key: string]: IDataSet };
type TitleToItemMap = { [key: string]: IIdentifierWithTags };

//
// transformation functions
//

function createMeasures(projectMeta: ProjectMetadata): TitleToItemMap {
    const newMapping: TitleToItemMap = {};

    projectMeta.catalog.metrics.forEach(metric => {
        const uniqueTitle = createUniqueName(metric.metric.meta.title, newMapping);
        newMapping[uniqueTitle] = {
            identifier: metric.metric.meta.identifier,
            tags: metric.metric.meta.tags,
        };
    });

    projectMeta.catalog.facts.forEach(fact => {
        const uniqueTitle = createUniqueName(fact.fact.meta.title, newMapping);
        newMapping[uniqueTitle] = { identifier: fact.fact.meta.identifier, tags: fact.fact.meta.tags };
    });

    return newMapping;
}

function createAttributes(attributes: Attribute[]): IAttrs {
    const newAttrs: IAttrs = {};

    attributes.forEach(attr => {
        const uniqueAttrTitle = createUniqueName(attr.attribute.meta.title, newAttrs);
        const newDisplayForms: IDisplayForms = {};
        let firstDisplayForm: IIdentifierWithTags | undefined;

        attr.attribute.content.displayForms.forEach(df => {
            const uniqueDfTitle = createUniqueName(df.meta.title, newDisplayForms);
            const newDisplayForm: IIdentifierWithTags = {
                identifier: df.meta.identifier,
                tags: df.meta.tags,
            };

            if (!firstDisplayForm) {
                firstDisplayForm = newDisplayForm;
            }

            newDisplayForms[uniqueDfTitle] = newDisplayForm;
        });

        if (firstDisplayForm) {
            const newAttr: IAttrItem = {
                identifier: attr.attribute.meta.identifier,
                tags: attr.attribute.meta.tags,
                defaultDisplayForm: firstDisplayForm,
                displayForms: newDisplayForms,
            };

            newAttrs[uniqueAttrTitle] = newAttr;
        }
    });

    return newAttrs;
}

function createCatalogAttributes(projectMeta: ProjectMetadata): IAttrs {
    return createAttributes(projectMeta.catalog.attributes);
}

function createDateDatasets(projectMeta: ProjectMetadata): TitleToDataSet {
    const newDataSets: TitleToDataSet = {};

    projectMeta.dateDataSets.forEach(dd => {
        const uniqueDsTitle = createUniqueName(dd.dateDataSet.meta.title, newDataSets);
        const attributes: IAttrs = createAttributes(dd.dateDataSet.content.attributes);
        const newDataSet: IDataSet = {
            identifier: dd.dateDataSet.meta.identifier,
            tags: dd.dateDataSet.meta.tags,
            attributes,
        };

        newDataSets[uniqueDsTitle] = newDataSet;
    });

    return newDataSets;
}

function createVisualizations(projectMeta: ProjectMetadata): TitleToItemMap {
    const newMapping: TitleToItemMap = {};

    projectMeta.insights.forEach(insight => {
        const uniqueTitle = createUniqueName(insight.title, newMapping);
        newMapping[uniqueTitle] = { identifier: insight.identifier, tags: insight.tags };
    });

    return newMapping;
}

function mergeData(
    original: any,
    current: any,
    mergePaths = ["visualizations", "measures", "attributes", "dateDataSets"],
    subItemKeys = ["displayForms", "attributes"],
): ICatalog {
    const result = cloneDeep(current);
    // for each path
    mergePaths.forEach(path => {
        // clear path
        set(result, path, {});
        const currentItems = get(current, path);
        const originalItems = get(original, path);
        // for each item in current
        forOwn(currentItems, (currentItem, currentItemKey) => {
            // try to lookup original key
            const matchingKey = findKey(originalItems, item => item.identifier === currentItem.identifier);
            // insert found items with original keys
            // insert unmatched items with current key
            let resultItem = currentItem;
            if (matchingKey) {
                // look for subItemKeys and process them recursively
                subItemKeys.forEach(subItemKey => {
                    if (Object.prototype.hasOwnProperty.call(resultItem, subItemKey)) {
                        resultItem = mergeData(originalItems[matchingKey], resultItem, [subItemKey]);
                    }
                });
            }
            // check and resolve key conflicts
            const resolvedKey = matchingKey || currentItemKey;
            const nonConflictKey = createUniqueName(resolvedKey, get(result, path));
            if (resolvedKey !== nonConflictKey) {
                console.warn("resolving duplicate key", resolvedKey, "into", nonConflictKey); // eslint-disable-line no-console
            }
            set(result, [path, nonConflictKey], resultItem);
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
export function transformToCatalog(projectMeta: ProjectMetadata, existingCatalog?: any): any {
    const measures = createMeasures(projectMeta);
    const measuresProp = !isEmpty(measures) ? { measures } : {};
    const attributes = createCatalogAttributes(projectMeta);
    const dateDataSets = createDateDatasets(projectMeta);
    const visualizations = createVisualizations(projectMeta);

    const newCatalog: ICatalog = {
        projectId: projectMeta.projectId,
        ...measuresProp,
        attributes,
        visualizations,
        dateDataSets,
    };

    if (existingCatalog) {
        return mergeData(existingCatalog, newCatalog);
    }

    return newCatalog;
}
