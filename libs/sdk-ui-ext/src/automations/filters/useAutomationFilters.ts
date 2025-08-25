// (C) 2025 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableFilter, UiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";

import { useFilterOptions } from "./FilterOptionsContext.js";
import { formatWorkspaceUserFilterOptions } from "../format.js";
import { messages } from "../messages.js";
import { AutomationsPreselectedFilters } from "../types.js";
import { useUser } from "../UserContext.js";

//generic filter hook

const useAutomationFilter = (
    filterOptions: UiAsyncTableFilterOption[],
    filterLabel: string,
    preselectedValues: Array<string> | undefined,
) => {
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

    const filterQuery = useMemo(() => {
        if (selectedFilterOptions.length === filterOptions.length) {
            return "";
        }
        return selectedFilterOptions.map((option) => option.value).join(",");
    }, [selectedFilterOptions, filterOptions]);

    return { filter, filterQuery };
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

    const { filter: dashboardFilter, filterQuery: dashboardFilterQuery } = useAutomationFilter(
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

    const { filter: recipientsFilter, filterQuery: recipientsFilterQuery } = useAutomationFilter(
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

    const { filter: createdByFilter, filterQuery: createdByFilterQuery } = useAutomationFilter(
        createdByFilterOptions,
        intl.formatMessage(messages.filterCreatedByLabel),
        preselectedValues,
    );

    return { createdByFilter, createdByFilterQuery };
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

    const { filter: statusFilter, filterQuery: statusFilterQuery } = useAutomationFilter(
        options,
        intl.formatMessage(messages.filterStatusLabel),
        preselectedValues,
    );

    return { statusFilter, statusFilterQuery };
};

export const useAutomationFilters = (preselectedFilters: AutomationsPreselectedFilters) => {
    const { dashboardFilter, dashboardFilterQuery } = useDashboardFilter(preselectedFilters.dashboard);
    const { recipientsFilter, recipientsFilterQuery } = useRecipientsFilter(preselectedFilters.recipients);
    const { createdByFilter, createdByFilterQuery } = useCreatedByFilter(preselectedFilters.createdBy);
    const { statusFilter, statusFilterQuery } = useStatusFilter(preselectedFilters.status);

    return {
        dashboardFilter,
        dashboardFilterQuery,
        recipientsFilter,
        recipientsFilterQuery,
        createdByFilter,
        createdByFilterQuery,
        statusFilter,
        statusFilterQuery,
    };
};
