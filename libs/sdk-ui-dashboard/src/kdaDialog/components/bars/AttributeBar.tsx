// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useId } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
} from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    type IAttributeFilterButtonProps,
    type IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import { type OverlayPositionType, UiChip, UiSkeleton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { StandaloneDashboardAttributeFilter } from "../../../presentation/filterBar/attributeFilter/DefaultDashboardAttributeFilter.js";

interface IAttributeBarProps {
    attribute: IDashboardAttributeFilter;
    attributeConfigs: IDashboardAttributeFilterConfig[];
    onChange?: (newFilter: IDashboardAttributeFilter) => void;
    onDelete?: (filter: IDashboardAttributeFilter) => void;
}

type IAttributeBarInnerProps = Omit<IAttributeBarProps, "attribute" | "attributeConfigs"> & {
    currentFilter: IDashboardAttributeFilter;
    deleteAriaLabel: string;
};

export function AttributeBar(props: IAttributeBarProps) {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "kdaDialog.dialog.bars.attribute.deleteLabel" });

    const config = props.attributeConfigs.find(
        (attribute) => attribute.localIdentifier === props.attribute.attributeFilter.localIdentifier,
    );
    const displayAsLabel = config?.displayAsLabel;

    return (
        <div className={cx("gd-kda-dialog-bar__attribute")}>
            <KdaAttributeFilterWrapper
                filter={props.attribute}
                displayAsLabel={displayAsLabel}
                overlayPositionType={"absolute"}
                deleteAriaLabel={deleteAriaLabel}
                onChange={props.onChange}
                onDelete={props.onDelete}
            />
        </div>
    );
}

function KdaAttributeFilterWrapper({
    filter,
    displayAsLabel,
    overlayPositionType,
    deleteAriaLabel,
    onChange,
    onDelete,
}: {
    filter: IDashboardAttributeFilter;
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
    deleteAriaLabel?: string;
    onChange?: (newFilter: IDashboardAttributeFilter) => void;
    onDelete?: (filter: IDashboardAttributeFilter) => void;
}) {
    const handleFilterChanged = useCallback(
        (newFilter: IDashboardAttributeFilter) => {
            onChange?.(newFilter);
        },
        [onChange],
    );

    const handleFilterDeleted = useCallback(
        (filter: IDashboardAttributeFilter) => {
            onDelete?.(filter);
        },
        [onDelete],
    );

    return (
        <StandaloneDashboardAttributeFilter
            filter={filter}
            displayAsLabel={displayAsLabel}
            overlayPositionType={overlayPositionType}
            onFilterChanged={handleFilterChanged}
            AttributeFilterComponent={(afProps) => (
                <KdaAttributeFilterComponent
                    {...afProps}
                    currentFilter={filter}
                    onDelete={handleFilterDeleted}
                    deleteAriaLabel={deleteAriaLabel ?? ""}
                />
            )}
            AttributeFilterLoadingComponent={KdaAttributeFilterLoadingComponent}
        />
    );
}

function KdaAttributeFilterComponent({
    onDelete,
    currentFilter,
    deleteAriaLabel,
    ...props
}: IAttributeFilterButtonProps & IAttributeBarInnerProps) {
    return (
        <AttributeFilterButton
            {...props}
            LoadingComponent={KdaAttributeFilterLoadingComponent}
            DropdownButtonComponent={(ddProps) => (
                <KdaAttributeFilterDropdownButtonComponent
                    {...ddProps}
                    deleteAriaLabel={deleteAriaLabel}
                    currentFilter={currentFilter}
                    onDelete={onDelete}
                />
            )}
        />
    );
}

function KdaAttributeFilterLoadingComponent() {
    return <UiSkeleton itemWidth={160} itemHeight={27} itemBorderRadius={20} />;
}

function KdaAttributeFilterDropdownButtonComponent(
    props: IAttributeFilterDropdownButtonProps & IAttributeBarInnerProps,
) {
    const label = `${props.title!}: ${props.subtitle!}`;
    const tag = props.selectedItemsCount ? `(${props.selectedItemsCount})` : undefined;
    const attributeFilterTooltipId = useId();

    const tooltipContent = (
        <>
            {label}
            {tag ? ` ${tag}` : null}
        </>
    );

    return (
        <UiTooltip
            id={attributeFilterTooltipId}
            arrowPlacement="top-start"
            content={tooltipContent}
            optimalPlacement
            triggerBy={["hover", "focus"]}
            anchor={
                <UiChip
                    label={label}
                    isDeletable
                    tag={tag}
                    isLocked={false}
                    isActive={props.isOpen}
                    onClick={props.onClick}
                    onDelete={() => {
                        props.onDelete?.(props.currentFilter);
                    }}
                    onDeleteKeyDown={(event) => {
                        // Do not propagate event to parent as attribute filter would always open
                        event.stopPropagation();
                    }}
                    accessibilityConfig={{
                        isExpanded: props.isOpen,
                        popupId: props.dropdownId,
                        popupType: "dialog",
                        deleteAriaLabel: props.deleteAriaLabel,
                        ariaDescribedBy: attributeFilterTooltipId,
                    }}
                    buttonRef={props.buttonRef as MutableRefObject<HTMLButtonElement>}
                />
            }
        />
    );
}
