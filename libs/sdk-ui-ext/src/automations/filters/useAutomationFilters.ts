// (C) 2025 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { AutomationFilterType } from "@gooddata/sdk-backend-spi";
import { UiAsyncTableFilter, UiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";

import { useFilterOptions } from "./FilterOptionsContext.js";
import { AUTOMATION_FILTER_EXCLUDE_THRESHOLD } from "../constants.js";
import { formatWorkspaceUserFilterOptions } from "../format.js";
import { messages } from "../messages.js";
import {
    AutomationsAvailableFilters,
    AutomationsFilterName,
    AutomationsPreselectedFilters,
    IAutomationFilter,
} from "../types.js";
import { useUser } from "../UserContext.js";

//generic filter hook

const useAutomationFilter = (
    filterOptions: UiAsyncTableFilterOption[],
    filterLabel: string,
    preselectedValues: Array<string> | undefined,
): IAutomationFilter => {
    const preselectedFilterOptions = useMemo(() => {
        return preselectedValues?.map((value) => ({ value, label: "" }));
    }, [preselectedValues]);

    useEffect(() => {
        if (!preselectedFilterOptions) {
            setSelectedFilterOptions(filterOptions);
        }
    }, [filterOptions, preselectedFilterOptions]);

    const [selectedFilterOptions, setSelectedFilterOptions] = useState<Array<UiAsyncTableFilterOption>>(
        preselectedFilterOptions ?? filterOptions,
    );

    const filter: UiAsyncTableFilter = useMemo(() => {
        return {
            label: filterLabel,
            options: filterOptions,
            onItemsSelect: (options) => {
                setSelectedFilterOptions(options);
            },
            isMultiSelect: true,
            selected: selectedFilterOptions,
        } as UiAsyncTableFilter;
    }, [filterOptions, selectedFilterOptions, filterLabel]);

    const query = useMemo(() => {
        // If all options are selected, no filter needed
        if (selectedFilterOptions.length === filterOptions.length || selectedFilterOptions.length === 0) {
            return { value: "" };
        }
        const selectedCount = selectedFilterOptions.length;
        const totalCount = filterOptions.length;
        const unselectedCount = totalCount - selectedCount;

        // Use exclude if it's more efficient (larger dataset and fewer unselected items)
        if (totalCount > AUTOMATION_FILTER_EXCLUDE_THRESHOLD && unselectedCount < selectedCount) {
            const unselectedOptions = filterOptions.filter(
                (option) => !selectedFilterOptions.some((selected) => selected.value === option.value),
            );
            return {
                value: unselectedOptions.map((option) => option.value).join(","),
                type: "exclude" as AutomationFilterType,
            };
        }

        // Default to include
        return {
            value: selectedFilterOptions.map((option) => option.value).join(","),
            type: "include" as AutomationFilterType,
        };
    }, [selectedFilterOptions, filterOptions]);

    return { filter, query };
};

//specific filters hooks

const useDashboardFilter = (preselectedValues: Array<string> | undefined) => {
    const intl = useIntl();

    const { dashboards } = useFilterOptions();

    const options = useMemo(() => {
        return dashboards.map((item) => ({
            value: item.identifier,
            label: String(item.title),
        }));
    }, [dashboards]);

    const { filter: dashboardFilter, query: dashboardFilterQuery } = useAutomationFilter(
        options,
        intl.formatMessage(messages.filterDashboardLabel),
        preselectedValues,
    );

    return { dashboardFilter, dashboardFilterQuery };
};

const useRecipientsFilter = (preselectedValues: Array<string> | undefined) => {
    const intl = useIntl();

    const { workspaceUsers } = useFilterOptions();
    const { isCurrentUserByLogin } = useUser();

    const options = useMemo(
        () => formatWorkspaceUserFilterOptions(workspaceUsers, isCurrentUserByLogin, intl),
        [workspaceUsers, intl, isCurrentUserByLogin],
    );

    const { filter: recipientsFilter, query: recipientsFilterQuery } = useAutomationFilter(
        options,
        intl.formatMessage(messages.filterRecipientsLabel),
        preselectedValues,
    );

    return { recipientsFilter, recipientsFilterQuery };
};

const useCreatedByFilter = (preselectedValues: Array<string> | undefined) => {
    const intl = useIntl();

    const { workspaceUsers } = useFilterOptions();
    const { isCurrentUserByLogin } = useUser();

    const createdByFilterOptions = useMemo(
        () => formatWorkspaceUserFilterOptions(workspaceUsers, isCurrentUserByLogin, intl),
        [workspaceUsers, intl, isCurrentUserByLogin],
    );

    const { filter: createdByFilter, query: createdByFilterQuery } = useAutomationFilter(
        createdByFilterOptions,
        intl.formatMessage(messages.filterCreatedByLabel),
        preselectedValues,
    );

    return { createdByFilter, createdByFilterQuery };
};

const useWorkspacesFilter = (preselectedValues: Array<string> | undefined) => {
    const intl = useIntl();

    const { workspaces } = useFilterOptions();

    const options = useMemo(() => {
        return workspaces.map((item) => ({
            value: item.id,
            label: String(item.title),
        }));
    }, [workspaces]);

    const { filter: workspacesFilter, query: workspacesFilterQuery } = useAutomationFilter(
        options,
        intl.formatMessage(messages.filterWorkspacesLabel),
        preselectedValues,
    );

    return { workspacesFilter, workspacesFilterQuery };
};

const useStatusFilter = (preselectedValues: Array<string> | undefined) => {
    const intl = useIntl();

    const options = useMemo(() => {
        return [
            { value: "SUCCESS", label: intl.formatMessage(messages.filterStatusSuccess) },
            { value: "FAILED", label: intl.formatMessage(messages.filterStatusFailed) },
            { value: "NEVER_RUN", label: intl.formatMessage(messages.filterStatusNeverRun) },
        ];
    }, [intl]);

    const { filter: statusFilter, query: statusFilterQuery } = useAutomationFilter(
        options,
        intl.formatMessage(messages.filterStatusLabel),
        preselectedValues,
    );

    return { statusFilter, statusFilterQuery };
};

export const useAutomationFilters = (
    preselectedFilters: AutomationsPreselectedFilters,
    availableFilters: AutomationsAvailableFilters,
) => {
    const { dashboardFilter, dashboardFilterQuery } = useDashboardFilter(preselectedFilters.dashboard);
    const { recipientsFilter, recipientsFilterQuery } = useRecipientsFilter(preselectedFilters.recipients);
    const { createdByFilter, createdByFilterQuery } = useCreatedByFilter(preselectedFilters.createdBy);
    const { statusFilter, statusFilterQuery } = useStatusFilter(preselectedFilters.status);
    const { workspacesFilter, workspacesFilterQuery } = useWorkspacesFilter(preselectedFilters.workspace);

    const filters = useMemo(() => {
        const filterMapping: Record<AutomationsFilterName, UiAsyncTableFilter> = {
            dashboard: dashboardFilter,
            createdBy: createdByFilter,
            recipients: recipientsFilter,
            status: statusFilter,
            workspace: workspacesFilter,
        };

        return availableFilters.map((filterName) => filterMapping[filterName]).filter(Boolean);
    }, [
        availableFilters,
        dashboardFilter,
        createdByFilter,
        recipientsFilter,
        statusFilter,
        workspacesFilter,
    ]);

    return {
        filters,
        dashboardFilterQuery,
        recipientsFilterQuery,
        createdByFilterQuery,
        statusFilterQuery,
        workspacesFilterQuery,
    };
};
