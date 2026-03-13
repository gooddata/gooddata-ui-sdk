// (C) 2020-2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import {
    type FilterContextItem,
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { dashboardFilterContextDefinition } from "../../../../../_staging/dashboard/dashboardFilterContext.js";
import { defaultDateFilterConfig } from "../../../../../_staging/dateFilterConfig/defaultConfig.js";
import { safeSerializeObjRef } from "../../../../../_staging/metadata/safeSerializeObjRef.js";

type TTargetDashboardFiltersCacheStatus = "loading" | "success" | "error";

interface ITargetDashboardFiltersCacheEntry {
    status: TTargetDashboardFiltersCacheStatus;
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
}

interface ITargetDashboardFiltersContextValue {
    cache: Record<string, ITargetDashboardFiltersCacheEntry>;
    fetchTargetDashboardFilters: (dashboardRef: ObjRef, dashboardTab?: string) => void;
}

interface ITargetDashboardFiltersProviderProps {
    children: ReactNode;
}

function getTargetDashboardFilterData(
    dashboard: IDashboard,
    targetTabLocalIdentifier?: string,
): Omit<ITargetDashboardFiltersCacheEntry, "status"> {
    const targetTab = targetTabLocalIdentifier
        ? dashboard.tabs?.find((tab) => tab.localIdentifier === targetTabLocalIdentifier)
        : dashboard.tabs?.[0];

    const targetDashboard = targetTab
        ? {
              ...dashboard,
              filterContext: targetTab.filterContext,
              dateFilterConfig: targetTab.dateFilterConfig,
              dateFilterConfigs: targetTab.dateFilterConfigs,
              attributeFilterConfigs: targetTab.attributeFilterConfigs,
          }
        : dashboard;
    const targetDashboardFilters = dashboardFilterContextDefinition(
        targetDashboard,
        defaultDateFilterConfig,
    ).filters;

    return {
        targetDashboardFilters,
        targetDashboardAttributeFilters: targetDashboardFilters.filter(isDashboardAttributeFilter),
        targetDashboardAttributeFilterConfigs: targetDashboard.attributeFilterConfigs ?? [],
    };
}

function createEmptyCacheEntry(
    status: TTargetDashboardFiltersCacheStatus,
): ITargetDashboardFiltersCacheEntry {
    return {
        status,
        targetDashboardFilters: [],
        targetDashboardAttributeFilters: [],
        targetDashboardAttributeFilterConfigs: [],
    };
}

export function getTargetDashboardFiltersCacheKey(dashboardRef: ObjRef, dashboardTab?: string): string {
    return `${safeSerializeObjRef(dashboardRef)}::${dashboardTab ?? "__default__"}`;
}

const TargetDashboardFiltersContext = createContext<ITargetDashboardFiltersContextValue | undefined>(
    undefined,
);
TargetDashboardFiltersContext.displayName = "TargetDashboardFiltersContext";

/**
 * @internal
 */
export function TargetDashboardFiltersProvider({ children }: ITargetDashboardFiltersProviderProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const [cache, setCache] = useState<Record<string, ITargetDashboardFiltersCacheEntry>>({});
    const cacheRef = useRef<Record<string, ITargetDashboardFiltersCacheEntry>>({});

    const setCacheEntry = useCallback(
        (cacheKey: string, entry: ITargetDashboardFiltersCacheEntry) => {
            const nextCache = {
                ...cacheRef.current,
                [cacheKey]: entry,
            };

            cacheRef.current = nextCache;
            setCache(nextCache);
        },
        [setCache],
    );

    const fetchTargetDashboardFilters = useCallback(
        (dashboardRef: ObjRef, dashboardTab?: string) => {
            const cacheKey = getTargetDashboardFiltersCacheKey(dashboardRef, dashboardTab);
            const cacheEntry = cacheRef.current[cacheKey];

            if (cacheEntry) {
                return;
            }

            setCacheEntry(cacheKey, createEmptyCacheEntry("loading"));

            void backend
                .workspace(workspace)
                .dashboards()
                .getDashboard(dashboardRef)
                .then((targetDashboard) => {
                    const targetDashboardFilterData = getTargetDashboardFilterData(
                        targetDashboard,
                        dashboardTab,
                    );
                    setCacheEntry(cacheKey, {
                        status: "success",
                        ...targetDashboardFilterData,
                    });
                })
                .catch(() => {
                    setCacheEntry(cacheKey, createEmptyCacheEntry("error"));
                });
        },
        [backend, workspace, setCacheEntry],
    );

    const value = useMemo(
        () => ({
            cache,
            fetchTargetDashboardFilters,
        }),
        [cache, fetchTargetDashboardFilters],
    );

    return (
        <TargetDashboardFiltersContext.Provider value={value}>
            {children}
        </TargetDashboardFiltersContext.Provider>
    );
}

export function useTargetDashboardFiltersContext(): ITargetDashboardFiltersContextValue {
    const context = useContext(TargetDashboardFiltersContext);

    if (!context) {
        throw new Error(
            "useTargetDashboardFiltersContext must be used within TargetDashboardFiltersProvider",
        );
    }

    return context;
}
