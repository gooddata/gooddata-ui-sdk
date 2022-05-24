// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { AttributeFilterButton, IAttributeDropdownBodyExtendedProps } from "@gooddata/sdk-ui-filters";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { Icon } from "@gooddata/sdk-ui-kit";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter";

import { IDashboardAttributeFilterProps } from "./types";
import { AttributeFilterBody } from "./dashboardDropdownBody/AttributeFilterBody";
import { useParentFilters } from "./useParentFilters";
import { selectLocale, useDashboardSelector } from "../../../model";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (props: IDashboardAttributeFilterProps): JSX.Element => {
    const { filter, onFilterChanged, isDraggable } = props;
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);
    const locale = useDashboardSelector(selectLocale);
    const attributeFilter = useMemo(() => dashboardAttributeFilterToAttributeFilter(filter), [filter]);
    const theme = useTheme();

    return (
        <AttributeFilterButton
            filter={attributeFilter}
            onApply={(newFilter) => {
                onFilterChanged(
                    attributeFilterToDashboardAttributeFilter(
                        newFilter,
                        filter.attributeFilter.localIdentifier,
                    ),
                );
            }}
            renderBody={(filterBodyProps: IAttributeDropdownBodyExtendedProps) => {
                return <AttributeFilterBody {...filterBodyProps} />;
            }}
            parentFilters={parentFilters}
            parentFilterOverAttribute={parentFilterOverAttribute}
            locale={locale}
            buttonProps={
                isDraggable
                    ? {
                          className: "is-draggable",
                          startAdornment: (
                              <Icon.DragHandle
                                  width={7}
                                  height={26}
                                  className="drag-handle-icon"
                                  color={theme?.palette?.complementary?.c5}
                              />
                          ),
                      }
                    : undefined
            }
        />
    );
};
