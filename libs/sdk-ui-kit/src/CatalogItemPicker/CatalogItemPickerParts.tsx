// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useMemo } from "react";

import cx from "classnames";

import { type CatalogItemListboxItem, type ICatalogItemPickerListItemData } from "./listboxItemBuilders.js";
import { testIds } from "./messages.js";
import { type CatalogItemPickerType } from "./types.js";
import type { IconType } from "../@ui/@types/icon.js";
import { type ThemeColor } from "../@ui/@types/themeColors.js";
import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { UiButtonSegmentedControl } from "../@ui/UiButtonSegmentedControl/UiButtonSegmentedControl.js";
import { UiCheckbox } from "../@ui/UiCheckbox/UiCheckbox.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import {
    type IUiListboxInteractiveItem,
    type IUiListboxInteractiveItemProps,
} from "../@ui/UiListbox/types.js";
import { UiListbox } from "../@ui/UiListbox/UiListbox.js";
import { UiSubmenuHeader } from "../@ui/UiSubmenuHeader/UiSubmenuHeader.js";
import { UiTooltip } from "../@ui/UiTooltip/UiTooltip.js";
import { Input } from "../Form/Input.js";

const { e } = bem("gd-ui-kit-catalog-item-picker");

/**
 * Returns icon type and color for a catalog item type.
 */
export function getTypeIcon(type: CatalogItemPickerType): { icon: IconType; color: ThemeColor } {
    switch (type) {
        case "metric":
            return { icon: "metric", color: "success" };
        case "date":
            return { icon: "date", color: "primary" };
        default:
            return { icon: "ldmAttribute", color: "warning" };
    }
}

// ============================================================================
// CatalogItemPickerHeader
// ============================================================================

interface ICatalogItemPickerHeaderProps {
    title: string;
    onBack?: () => void;
    onClose: () => void;
    backAriaLabel: string;
    closeAriaLabel: string;
}

export function CatalogItemPickerHeader({
    title,
    onBack,
    onClose,
    backAriaLabel,
    closeAriaLabel,
}: ICatalogItemPickerHeaderProps): ReactNode {
    return (
        <UiSubmenuHeader
            title={title}
            onBack={onBack}
            onClose={onClose}
            backAriaLabel={backAriaLabel}
            closeAriaLabel={closeAriaLabel}
            height="medium"
        />
    );
}

// ============================================================================
// CatalogItemPickerSearch
// ============================================================================

interface ICatalogItemPickerSearchProps {
    variant: "mvf" | "addFilter";
    value: string;
    onChange: (value: string | number) => void;
    onEscKeyPress: (event: KeyboardEvent) => void;
    placeholder: string;
    ariaLabel: string;
}

export function CatalogItemPickerSearch({
    variant,
    value,
    onChange,
    onEscKeyPress,
    placeholder,
    ariaLabel,
}: ICatalogItemPickerSearchProps): ReactNode {
    return (
        <div className={e("search", { variant })} data-testid={testIds.search}>
            <Input
                className={e("search-input", { variant })}
                value={value}
                onChange={onChange}
                onEscKeyPress={onEscKeyPress}
                placeholder={placeholder}
                autofocus
                clearOnEsc
                isSearch
                isSmall
                accessibilityConfig={{
                    ariaLabel,
                }}
            />
        </div>
    );
}

// ============================================================================
// CatalogItemPickerTabs
// ============================================================================

interface ICatalogItemPickerTabsProps {
    variant: "mvf" | "addFilter";
    itemTypes: CatalogItemPickerType[];
    effectiveType: CatalogItemPickerType;
    getAriaLabel: (type: CatalogItemPickerType) => string;
    onChange: (type: CatalogItemPickerType) => void;
}

export function CatalogItemPickerTabs({
    variant,
    itemTypes,
    effectiveType,
    getAriaLabel,
    onChange,
}: ICatalogItemPickerTabsProps): ReactNode {
    return (
        <div className={e("type-filter", { variant })} data-testid={testIds.typeFilter}>
            <UiButtonSegmentedControl layout="fill">
                {itemTypes.map((type, index) => {
                    const { icon, color } = getTypeIcon(type);
                    return (
                        <UiIconButton
                            key={type}
                            icon={icon}
                            iconColor={color}
                            size="small"
                            variant="secondary"
                            isActive={effectiveType === type}
                            onClick={() => onChange(type)}
                            accessibilityConfig={{
                                ariaLabel: getAriaLabel(type),
                            }}
                            dataTestId={`${testIds.tab}-${index}`}
                        />
                    );
                })}
            </UiButtonSegmentedControl>
        </div>
    );
}

// ============================================================================
// CatalogItemPickerList
// ============================================================================

function CatalogItemPickerItemComponent<TPayload>({
    item,
    isFocused,
    isCompact,
    onSelect,
    variant,
}: IUiListboxInteractiveItemProps<ICatalogItemPickerListItemData<TPayload>> & {
    variant: "mvf" | "addFilter";
}): ReactNode {
    const { item: pickerItem, isSelected } = item.data;
    const { icon, color } = getTypeIcon(pickerItem.type);

    return (
        <div
            className={cx("gd-ui-kit-listbox__item", e("item", { isSelected, variant }), {
                "gd-ui-kit-listbox__item--isFocused": isFocused,
                "gd-ui-kit-listbox__item--isCompact": isCompact,
            })}
            onClick={onSelect}
        >
            <span
                className={e("item-checkbox")}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <UiCheckbox
                    checked={isSelected}
                    tabIndex={-1}
                    preventDefault
                    onChange={(event) => {
                        onSelect(event as unknown as MouseEvent);
                    }}
                />
            </span>
            <UiIcon type={icon} size={16} color={color} />
            <span className={e("item-title")}>{pickerItem.title}</span>
            {pickerItem.sequenceNumber ? (
                <span className={e("item-sequence")}>{pickerItem.sequenceNumber}</span>
            ) : null}
        </div>
    );
}

function CatalogItemPickerSingleSelectItem({
    item,
    isFocused,
    isCompact,
    onSelect,
    variant,
}: IUiListboxInteractiveItemProps<ICatalogItemPickerListItemData> & {
    variant: "mvf" | "addFilter";
}): ReactNode {
    const { icon, color } = getTypeIcon(item.data.item.type);
    return (
        <div
            className={cx("gd-ui-kit-listbox__item", e("item", { isSelected: false, variant }), {
                "gd-ui-kit-listbox__item--isFocused": isFocused,
                "gd-ui-kit-listbox__item--isCompact": isCompact,
            })}
            onClick={onSelect}
        >
            <UiIcon type={icon} size={16} color={color} />
            <span className={e("item-title")}>{item.data.item.title}</span>
            {item.data.item.sequenceNumber ? (
                <span className={e("item-sequence")}>{item.data.item.sequenceNumber}</span>
            ) : null}
        </div>
    );
}

interface ICatalogItemPickerListProps {
    variant: "mvf" | "addFilter";
    listboxItems: CatalogItemListboxItem[];
    isMultiSelect: boolean;
    maxListHeight?: number;
    listboxId: string;
    ariaLabel: string;
    shouldShowEmptyStateMessage: boolean;
    emptyMessage: string;
    onSelect: (item: IUiListboxInteractiveItem<ICatalogItemPickerListItemData>) => void;
}

export function CatalogItemPickerList({
    variant,
    listboxItems,
    isMultiSelect,
    maxListHeight,
    listboxId,
    ariaLabel,
    shouldShowEmptyStateMessage,
    emptyMessage,
    onSelect,
}: ICatalogItemPickerListProps): ReactNode {
    const InteractiveItemComponent = useMemo(() => {
        return isMultiSelect
            ? (props: IUiListboxInteractiveItemProps<ICatalogItemPickerListItemData>) => (
                  <CatalogItemPickerItemComponent {...props} variant={variant} />
              )
            : (props: IUiListboxInteractiveItemProps<ICatalogItemPickerListItemData>) => (
                  <CatalogItemPickerSingleSelectItem {...props} variant={variant} />
              );
    }, [isMultiSelect, variant]);

    return (
        <div className={e("list", { variant })}>
            {shouldShowEmptyStateMessage ? (
                <div className={e("empty", { variant })}>{emptyMessage}</div>
            ) : (
                <UiListbox
                    items={listboxItems}
                    onSelect={onSelect}
                    shouldCloseOnSelect={false}
                    isCompact
                    maxHeight={maxListHeight}
                    InteractiveItemComponent={InteractiveItemComponent}
                    ariaAttributes={{
                        id: listboxId,
                        "aria-label": ariaLabel,
                    }}
                    dataTestId={testIds.list}
                />
            )}
        </div>
    );
}

// ============================================================================
// CatalogItemPickerFooter
// ============================================================================

interface ICatalogItemPickerFooterProps {
    variant: "mvf" | "addFilter";
    isAddDisabled: boolean;
    onClose: () => void;
    onAdd: () => void;
    cancelLabel: string;
    addLabel: string;
    addTooltip?: string;
}

export function CatalogItemPickerFooter({
    variant,
    isAddDisabled,
    onClose,
    onAdd,
    cancelLabel,
    addLabel,
    addTooltip,
}: ICatalogItemPickerFooterProps): ReactNode {
    return (
        <div className={e("footer", { variant })}>
            <UiButton
                label={cancelLabel}
                variant="secondary"
                size="small"
                onClick={onClose}
                dataTestId={testIds.cancel}
            />
            <UiTooltip
                content={addTooltip ?? ""}
                disabled={!isAddDisabled}
                triggerBy={["hover", "focus"]}
                anchor={
                    <span className={e("add-button")}>
                        <UiButton
                            label={addLabel}
                            variant="primary"
                            size="small"
                            onClick={onAdd}
                            isDisabled={isAddDisabled}
                            dataTestId={testIds.add}
                        />
                    </span>
                }
            />
        </div>
    );
}
