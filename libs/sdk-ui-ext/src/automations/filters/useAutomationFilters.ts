// (C) 2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { UiAsyncTableFilter, UiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";
import { useFilterOptions } from "./FilterOptionsContext.js";
import { messages } from "../messages.js";

export const ALL_DASHBOARDS_FILTER_VALUE = "__ALL_DASHBOARDS__";
export const ALL_RECIPIENTS_FILTER_VALUE = "__ALL_RECIPIENTS__";
export const ALL_CREATED_BY_FILTER_VALUE = "__ALL_CREATED_BY__";

//generic filter hook

const useAutomationFilter = (
    filterOptions: UiAsyncTableFilterOption[],
    allFilterOptionValue: string,
    allFilterOptionLabel: string,
    filterLabel,
) => {
    const allFilterOption = useMemo(
        () => ({
            value: allFilterOptionValue,
            label: allFilterOptionLabel,
        }),
        [allFilterOptionValue, allFilterOptionLabel],
    );

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

const useDashboardFilter = () => {
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
    );

    return { dashboardFilter, dashboardFilterQuery };
};

const useRecipientsFilter = () => {
    const intl = useIntl();

    const { workspaceUsers, isCurrentUser } = useFilterOptions();

    const options = useMemo(() => {
        return workspaceUsers.map((item) => ({
            value: item.uri,
            label: isCurrentUser(item.login) ? intl.formatMessage(messages.currentUser) : item.fullName,
        }));
    }, [workspaceUsers, intl, isCurrentUser]);

    const { filter: recipientsFilter, filterQuery: recipientsFilterQuery } = useAutomationFilter(
        options,
        ALL_RECIPIENTS_FILTER_VALUE,
        intl.formatMessage(messages.filterAllRecipients),
        intl.formatMessage(messages.filterRecipientsLabel),
    );

    return { recipientsFilter, recipientsFilterQuery };
};

const useCreatedByFilter = () => {
    const intl = useIntl();

    const { workspaceUsers, isCurrentUser } = useFilterOptions();

    const createdByFilterOptions = useMemo(() => {
        return workspaceUsers.map((item) => ({
            value: item.uri,
            label: isCurrentUser(item.login) ? intl.formatMessage(messages.currentUser) : item.fullName,
        }));
    }, [workspaceUsers, intl, isCurrentUser]);

    const { filter: createdByFilter, filterQuery: createdByFilterQuery } = useAutomationFilter(
        createdByFilterOptions,
        ALL_CREATED_BY_FILTER_VALUE,
        intl.formatMessage(messages.filterAllAuthors),
        intl.formatMessage(messages.filterCreatedByLabel),
    );

    return { createdByFilter, createdByFilterQuery };
};

export const useAutomationFilters = () => {
    const { dashboardFilter, dashboardFilterQuery } = useDashboardFilter();
    const { recipientsFilter, recipientsFilterQuery } = useRecipientsFilter();
    const { createdByFilter, createdByFilterQuery } = useCreatedByFilter();

    return {
        dashboardFilter,
        dashboardFilterQuery,
        recipientsFilter,
        recipientsFilterQuery,
        createdByFilter,
        createdByFilterQuery,
    };
};
