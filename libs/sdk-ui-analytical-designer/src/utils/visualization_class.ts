// (C) 2007-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IVisualizationClass, visClassUrl } from "@gooddata/sdk-model";
import { FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/internal";

import { LOCAL_COLUMN, LOCAL_TABLE } from "../constants/visualization_types.js";

interface IVisualizationClassWrapped {
    visualizationClass: IVisualizationClass;
}

/*
 * When adding new local visualization to AD:
 * 1. add featureFlag to puppet;
 * 2. add check of url to getDisabledVisClassesUrls function;
 * 3. upload preloaded visualization class to bear
 * 4. have a nice day
 */

export function findVisualizationClass(
    visualizationClasses: ReadonlyArray<IVisualizationClass>,
    className: string,
): IVisualizationClass {
    if (isEmpty(visualizationClasses)) {
        return null;
    }

    const visualizationClass = visualizationClasses.find(
        (visualizationClass) => visClassUrl(visualizationClass) === `local:${className}`,
    );
    return visualizationClass || null;
}

export function isVisualizationClassDeprecated(visualizationClass: IVisualizationClass): boolean {
    return isEmpty(visualizationClass);
}

/**
 * returns whether is local GDC visualization
 *
 * @param visualizationClass -
 */
export function isVisualizationClassLocal(visualizationClass: IVisualizationClass): boolean {
    if (isEmpty(visualizationClass)) {
        return false;
    }
    return visClassUrl(visualizationClass).startsWith("local:");
}

export function isVisualizationClassSupportedByUrl(url: string): boolean {
    return !!FullVisualizationCatalog.hasDescriptorForUri(url);
}

export function isVisualizationClassSupported(visualizationClass: IVisualizationClass): boolean {
    return isVisualizationClassSupportedByUrl(visClassUrl(visualizationClass));
}

export function getDefaultVisualizationClass(
    visualizationClasses: ReadonlyArray<IVisualizationClass>,
): IVisualizationClass {
    if (isEmpty(visualizationClasses)) {
        return null;
    }

    const filteredVisualizationClasses = visualizationClasses.filter(
        (visualizationClass) =>
            !isVisualizationClassDeprecated(visualizationClass) &&
            isVisualizationClassSupported(visualizationClass),
    );

    const columnClass = filteredVisualizationClasses.find(
        (visualizationClass) => visClassUrl(visualizationClass) === LOCAL_COLUMN,
    );
    const tableClass = filteredVisualizationClasses.find(
        (visualizationClass) => visClassUrl(visualizationClass) === LOCAL_TABLE,
    );

    return (columnClass || tableClass || filteredVisualizationClasses?.[0]) ?? null;
}

export function unwrapVisualizationClass(
    visualizationClassWrapped: IVisualizationClassWrapped,
): IVisualizationClass {
    if (isEmpty(visualizationClassWrapped)) {
        return null;
    }

    return visualizationClassWrapped.visualizationClass;
}
