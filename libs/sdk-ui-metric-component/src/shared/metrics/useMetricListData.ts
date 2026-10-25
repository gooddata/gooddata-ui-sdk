// (C) 2021-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { debounce } from "lodash-es";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useEvents } from "../eventing/useEvents.js";

import { getFilteredItems } from "./functions/metricListData.js";
import { events } from "./useMetricListData.events.js";
import { loadMetrics } from "./useMetrics.js";
import { useReloadMetrics } from "./useReloadMetrics.js";

interface ILoadListData {
    items: IMeasureMetadataObject[];
    totalCount: number;
}

type IUserMetricListData = (search: string, sort: IMetricListSort) => Promise<ILoadListData>;

/**
 * @internal
 */
export interface IMetricListSort {
    type: "title" | "id";
    direction: "asc" | "desc";
}

/**
 * @internal
 */
export interface IUseMetricList {
    items: IMeasureMetadataObject[];
    search: string;
    setSearch: (value: string) => void;
    sort: IMetricListSort;
    setSort: (sort: IMetricListSort) => void;
    totalCount: number;
}

export const getMetricListData =
    (
        backend: IAnalyticalBackend,
        workspaceId: string,
        onDataLoaded: (data: IMeasureMetadataObject[]) => void,
        loadPermissions = false,
    ): IUserMetricListData =>
    (search, sort: IMetricListSort) => {
        return loadMetrics(backend, workspaceId, loadPermissions).then((data) => {
            if (onDataLoaded) {
                onDataLoaded(data);
            }

            const filteredData = getFilteredItems(data, search);

            filteredData.sort((a, b) => {
                if (sort.direction === "asc") {
                    return a[sort.type].localeCompare(b[sort.type]);
                }
                return b[sort.type].localeCompare(a[sort.type]);
            });

            return {
                items: filteredData,
                totalCount: filteredData.length,
            };
        });
    };

/**
 * @internal
 */
export interface IUseMetricListDataOptions {
    /**
     * Ask the backend for each metric's object-level permissions.
     */
    loadPermissions?: boolean;
}

/**
 * @internal
 */
export const useMetricListData = ({
    loadPermissions = false,
}: IUseMetricListDataOptions = {}): IUseMetricList => {
    const [sort, setSort] = useState<IMetricListSort>({ type: "title", direction: "asc" });
    const [search, setSearch] = useState<string>("");

    const { workspaceMetricDataEvent } = useEvents(events);
    const debouncedTrackWorkspace = debounce(workspaceMetricDataEvent, 500);

    const workspaceId = useWorkspaceStrict();
    const backend = useBackendStrict();
    const { metricReloadRequest } = useReloadMetrics();
    const [listLoader, setListLoader] = useState(() =>
        getMetricListData(backend, workspaceId, debouncedTrackWorkspace, loadPermissions),
    );

    useEffect(() => {
        setListLoader(() =>
            getMetricListData(backend, workspaceId, debouncedTrackWorkspace, loadPermissions),
        );
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [backend, workspaceId, loadPermissions]);

    const { result = { items: [] } } = useCancelablePromise<ILoadListData>(
        {
            promise: () => listLoader(search, sort),
        },
        [listLoader, search, sort, metricReloadRequest],
    );

    return {
        items: result.items,
        totalCount: result.items.length,
        search,
        setSearch,
        sort,
        setSort,
    };
};
