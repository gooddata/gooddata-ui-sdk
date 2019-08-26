// (C) 2007-2018 GoodData Corporation
import * as classNames from "classnames";
import * as invariant from "invariant";
import first = require("lodash/first");
import get = require("lodash/get");

import { AFM } from "@gooddata/typings";

import { ASC, DESC } from "../../../../constants/sort";
import {
    isMappingHeaderAttribute,
    isMappingHeaderMeasureItem,
    IMappingHeader,
} from "../../../../interfaces/MappingHeader";
import { ISortInfo, ISortObj, SortDir } from "../../../../interfaces/Table";
import IAttributeSortItem = AFM.IAttributeSortItem;
import IMeasureSortItem = AFM.IMeasureSortItem;
import isAttributeSortItem = AFM.isAttributeSortItem;

function getSortBy(tableHeaders: IMappingHeader[], sortItemLocalIdentifier: string): number {
    const sortByColumnIndex: number = tableHeaders.findIndex(tableHeader => {
        if (isMappingHeaderMeasureItem(tableHeader)) {
            return tableHeader.measureHeaderItem.localIdentifier === sortItemLocalIdentifier;
        }
        if (isMappingHeaderAttribute(tableHeader)) {
            return tableHeader.attributeHeader.localIdentifier === sortItemLocalIdentifier;
        }
    });

    invariant(
        sortByColumnIndex >= 0,
        `Cannot find sort identifier ${sortItemLocalIdentifier} in table headers`,
    );

    return sortByColumnIndex;
}

function getSortItemAttributeIdentifier(sortItem: AFM.IAttributeSortItem): string {
    return get(sortItem, ["attributeSortItem", "attributeIdentifier"]) as string;
}

function getSortItemMeasureIdentifier(sortItem: AFM.IMeasureSortItem): string {
    const locators = get(sortItem, ["measureSortItem", "locators"]) as AFM.LocatorItem[];

    invariant(locators.length <= 1, "Measure sort item couldn't contain more than one locator");

    const firstLocator: AFM.LocatorItem = first(locators);

    return get(firstLocator, ["measureLocatorItem", "measureIdentifier"]) as string;
}

export function getHeaderSortClassName(sortDir: SortDir, currentSort: SortDir): string {
    return classNames({
        "gd-table-arrow-up": sortDir === ASC,
        "gd-table-arrow-down": sortDir === DESC,
        "s-sorted-asc": currentSort === ASC,
        "s-sorted-desc": currentSort === DESC,
    });
}

export function getNextSortDir(header: IMappingHeader, currentSortDir: SortDir): SortDir {
    if (!currentSortDir) {
        return isMappingHeaderMeasureItem(header) ? DESC : ASC;
    }

    return currentSortDir === ASC ? DESC : ASC;
}

export function getSortItem(executionRequest: AFM.IExecution): AFM.SortItem {
    const sorts = get(executionRequest, ["execution", "resultSpec", "sorts"], []);

    if (sorts.length === 0) {
        return null;
    }

    invariant(sorts.length === 1, "Table allows only one sort");

    return sorts[0];
}

export function getSortInfo(sortItem: AFM.SortItem, tableHeaders: IMappingHeader[]): ISortInfo {
    if (isAttributeSortItem(sortItem)) {
        const sortItemIdentifier = getSortItemAttributeIdentifier(sortItem as IAttributeSortItem);
        const sortBy: number = getSortBy(tableHeaders, sortItemIdentifier);
        const sortDir = get(sortItem, ["attributeSortItem", "direction"]) as SortDir;

        return { sortBy, sortDir };
    }

    const sortItemIdentifier = getSortItemMeasureIdentifier(sortItem as IMeasureSortItem);
    const sortBy: number = getSortBy(tableHeaders, sortItemIdentifier);
    const sortDir = get(sortItem, ["measureSortItem", "direction"]) as SortDir;

    return { sortBy, sortDir };
}

export function createSortItem(header: IMappingHeader, sortObj: ISortObj): AFM.SortItem {
    if (isMappingHeaderMeasureItem(header)) {
        return {
            measureSortItem: {
                direction: sortObj.nextDir,
                locators: [
                    {
                        measureLocatorItem: {
                            measureIdentifier: header.measureHeaderItem.localIdentifier,
                        },
                    },
                ],
            },
        };
    }

    if (isMappingHeaderAttribute(header)) {
        return {
            attributeSortItem: {
                direction: sortObj.nextDir,
                attributeIdentifier: header.attributeHeader.localIdentifier,
            },
        };
    }

    throw new Error(`Unknown mapping header type ${Object.keys(header)}`);
}
