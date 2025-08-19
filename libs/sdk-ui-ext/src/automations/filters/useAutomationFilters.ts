// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableFilter, UiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";

import { useFilterOptions } from "./FilterOptionsContext.js";
import {
    ALL_CREATED_BY_FILTER_VALUE,
    ALL_DASHBOARDS_FILTER_VALUE,
    ALL_RECIPIENTS_FILTER_VALUE,
    ALL_STATUS_FILTER_VALUE,
} from "../constants.js";
import { formatWorkspaceUserFilterOptions } from "../format.js";
import { messages } from "../messages.js";
import { AutomationsPreselectedFilters } from "../types.js";
import { useUser } from "../UserContext.js";

//generic filter hook

const useAutomationFilter = (
    filterOptions: UiAsyncTableFilterOption[],
    allFilterOptionValue: string,
    allFilterOptionLabel: string,
    filterLabel: string,
    preselectedValue: string | undefined,
) => {
    const allFilterOption = useMemo(
        () => ({
            value: allFilterOptionValue,
            label: allFilterOptionLabel,
        }),
        [allFilterOptionValue, allFilterOptionLabel],
    );

    const preselectedFilterOption = useMemo(() => {
        return preselectedValue && filterOptions.find((option) => option.value === preselectedValue);
    }, [preselectedValue, filterOptions]);

    useEffect(() => {
        if (preselectedFilterOption) {
            setSelectedFilterOption(preselectedFilterOption);
        }
    }, [preselectedFilterOption]);

    const isAllFilter = useCallback(
        (filter: UiAsyncTableFilterOption) => filter.value === allFilterOptionValue,
        [allFilterOptionValue],
    );

    const [selectedFilterOption, setSelectedFilterOption] =
        useState<UiAsyncTableFilterOption>(allFilterOption);

    const filter: UiAsyncTableFilter = useMemo(() => {
        return {
            label: filterLabel,
            options: [allFilterOption, ...filterOptions],
            onItemClick: (option) =>
                setSelectedFilterOption(
                    option.value === selectedFilterOption.value ? allFilterOption : option,
                ),
            selected: selectedFilterOption,
        };
    }, [filterOptions, selectedFilterOption, allFilterOption, filterLabel]);

    const filterQuery = useMemo(() => {
        return isAllFilter(selectedFilterOption) ? "" : selectedFilterOption.value;
    }, [selectedFilterOption, isAllFilter]);

    return { filter, filterQuery };
};

//specific filters hooks

const useDashboardFilter = (preselectedValue: string | undefined) => {
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
        ALL_DASHBOARDS_FILTER_VALUE,
        intl.formatMessage(messages.filterAllDashboards),
        intl.formatMessage(messages.filterDashboardLabel),
        preselectedValue,
    );

    return { dashboardFilter, dashboardFilterQuery };
};

const useRecipientsFilter = (preselectedValue: string | undefined) => {
    const intl = useIntl();

    const { workspaceUsers } = useFilterOptions();
    const { isCurrentUserByLogin } = useUser();

    const options = useMemo(
        () => formatWorkspaceUserFilterOptions(workspaceUsers, isCurrentUserByLogin, intl),
        [workspaceUsers, intl, isCurrentUserByLogin],
    );

    const { filter: recipientsFilter, filterQuery: recipientsFilterQuery } = useAutomationFilter(
        options,
        ALL_RECIPIENTS_FILTER_VALUE,
        intl.formatMessage(messages.filterAllRecipients),
        intl.formatMessage(messages.filterRecipientsLabel),
        preselectedValue,
    );

    return { recipientsFilter, recipientsFilterQuery };
};

const useCreatedByFilter = (preselectedValue: string | undefined) => {
    const intl = useIntl();

    const { workspaceUsers } = useFilterOptions();
    const { isCurrentUserByLogin } = useUser();

    const createdByFilterOptions = useMemo(
        () => formatWorkspaceUserFilterOptions(workspaceUsers, isCurrentUserByLogin, intl),
        [workspaceUsers, intl, isCurrentUserByLogin],
    );

    const { filter: createdByFilter, filterQuery: createdByFilterQuery } = useAutomationFilter(
        createdByFilterOptions,
        ALL_CREATED_BY_FILTER_VALUE,
        intl.formatMessage(messages.filterAllAuthors),
        intl.formatMessage(messages.filterCreatedByLabel),
        preselectedValue,
    );

    return { createdByFilter, createdByFilterQuery };
};

const useStatusFilter = (preselectedValue: string | undefined) => {
    const intl = useIntl();

    const options = useMemo(() => {
        return [
            { value: "SUCCESS", label: intl.formatMessage(messages.filterStatusSuccess) },
            { value: "FAILED", label: intl.formatMessage(messages.filterStatusFailed) },
        ];
    }, [intl]);

    const { filter: statusFilter, filterQuery: statusFilterQuery } = useAutomationFilter(
        options,
        ALL_STATUS_FILTER_VALUE,
        intl.formatMessage(messages.filterAllStatus),
        intl.formatMessage(messages.filterStatusLabel),
        preselectedValue,
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
