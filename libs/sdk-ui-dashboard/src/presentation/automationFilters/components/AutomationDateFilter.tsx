// (C) 2025 GoodData Corporation

import { MutableRefObject } from "react";
import { Bubble, BubbleHoverTrigger, OverlayPositionType, UiChip } from "@gooddata/sdk-ui-kit";
import { areObjRefsEqual, FilterContextItem, IDashboardDateFilter } from "@gooddata/sdk-model";
import { DefaultDashboardDateFilter, IDashboardDateFilterConfig } from "../../filterBar/index.js";
import {
    selectCatalogDateDatasets,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
    useDashboardSelector,
} from "../../../model/index.js";
import { useIntl } from "react-intl";

const tooltipAlignPoints = [
    { align: "bl tl", offset: { x: 11, y: 0 } },
    { align: "tl bl", offset: { x: 11, y: 0 } },
];

export function AutomationDateFilter({
    filter,
    onChange,
    onDelete,
    isLocked,
    isCommonDateFilter,
    overlayPositionType,
}: {
    filter: IDashboardDateFilter;
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
}) {
    const intl = useIntl();
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const commonDateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
    };

    const defaultDateFilterName = allDateDatasets.find((ds) =>
        areObjRefsEqual(ds.dataSet.ref, filter.dateFilter.dataSet),
    )?.dataSet?.title;
    const filterConfig = isCommonDateFilter
        ? commonDateFilterComponentConfig
        : {
              ...commonDateFilterComponentConfig,
              customFilterName: defaultDateFilterName,
          };

    return (
        <DefaultDashboardDateFilter
            filter={filter}
            workingFilter={filter}
            onFilterChanged={onChange}
            config={filterConfig}
            overlayPositionType={overlayPositionType}
            ButtonComponent={(props) => {
                const label = `${props.textTitle}: ${props.textSubtitle}`;
                return (
                    <BubbleHoverTrigger showDelay={200} hideDelay={0}>
                        <UiChip
                            label={label}
                            iconBefore="date"
                            isActive={props.isOpen}
                            isLocked={isLocked}
                            isDeletable={!isLocked && !isCommonDateFilter}
                            onDelete={() => onDelete(filter)}
                            onDeleteKeyDown={(event) => {
                                // Do not propagate event to parent as date filter would always open
                                event.stopPropagation();
                            }}
                            accessibilityConfig={{
                                isExpanded: props.isOpen,
                                deleteAriaLabel: intl.formatMessage({ id: "delete" }),
                            }}
                            buttonRef={props.buttonRef as MutableRefObject<HTMLButtonElement>}
                        />
                        <Bubble alignPoints={tooltipAlignPoints}>{label}</Bubble>
                    </BubbleHoverTrigger>
                );
            }}
        />
    );
}
