// (C) 2025-2026 GoodData Corporation

import { type RefObject, useId } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type ICatalogAttribute } from "@gooddata/sdk-model";
import {
    Dropdown,
    type IDropdownButtonRenderProps,
    InvertableSelectSearchBar,
    InvertableSelectVirtualised,
    SeparatorLine,
    UiButton,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { type IKdaItemGroup } from "../internalTypes.js";

import {
    getAttributeKey,
    getAttributeTitle,
    useKdaAttributesSelection,
} from "./hooks/useKdaAttributesSelection.js";
import { KdaAttributesSelectItem } from "./KdaAttributesSelectItem.js";

const ITEM_HEIGHT = 28;
const ALIGN_POINTS = [{ align: "tl bl" }];

export interface IKdaAttributesDropdownProps {
    buttonLabel: string;
    attributesCount: number;
    validAttributes: ICatalogAttribute[];
    initialAttributes: ICatalogAttribute[];
    mapAttributes: Map<string, IKdaItemGroup | undefined>;
    isSearchBarVisible: boolean;
    onApply: (selected: ICatalogAttribute[]) => void;
    onOpen: () => void;
    onClose: () => void;
}

export function KdaAttributesDropdown({
    buttonLabel,
    attributesCount,
    validAttributes,
    initialAttributes,
    mapAttributes,
    isSearchBarVisible,
    onApply,
    onOpen,
    onClose,
}: IKdaAttributesDropdownProps) {
    const intl = useIntl();
    const labelKeyDriversId = useId();
    const dropdownButtonId = useIdPrefixed("kda-attributes-dropdown-button");

    const {
        searchString,
        setSearchString,
        selection,
        isInverted,
        filteredOptions,
        resolvedSelection,
        isApplyDisabled,
        onSelect,
        resetSelection,
    } = useKdaAttributesSelection(validAttributes, initialAttributes);

    const popupLabel = intl.formatMessage({
        id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.popupLabel",
    });

    return (
        <Dropdown
            className="gd-kda-attributes-dropdown"
            closeOnEscape
            autofocusOnOpen
            overlayPositionType="sameAsTarget"
            alignPoints={ALIGN_POINTS}
            returnFocusTo={dropdownButtonId}
            onOpenStateChanged={(isOpen) => {
                if (isOpen) {
                    resetSelection();
                    onOpen();
                } else {
                    onClose();
                }
            }}
            renderButton={({ toggleDropdown, isOpen, buttonRef, dropdownId }: IDropdownButtonRenderProps) => (
                <UiButton
                    id={dropdownButtonId}
                    dataTestId={`${attributesCount}_attributes`}
                    ref={buttonRef as RefObject<HTMLButtonElement>}
                    variant="tertiary"
                    iconAfter="settings"
                    isSelected={isOpen}
                    label={buttonLabel}
                    onClick={toggleDropdown}
                    accessibilityConfig={{
                        ariaHaspopup: "dialog",
                        ariaExpanded: isOpen,
                        ariaControls: isOpen ? dropdownId : undefined,
                    }}
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                const handleApply = () => {
                    onApply(resolvedSelection);
                    closeDropdown();
                };

                return (
                    <div
                        {...ariaAttributes}
                        aria-labelledby={undefined}
                        aria-label={popupLabel}
                        className="gd-kda-attributes-dropdown__body"
                    >
                        <div className="gd-kda-attributes-dropdown__header">{popupLabel}</div>
                        <InvertableSelectVirtualised<ICatalogAttribute>
                            className="gd-kda-attributes-select"
                            adaptiveWidth
                            items={filteredOptions}
                            totalItemsCount={filteredOptions.length}
                            itemHeight={ITEM_HEIGHT}
                            getItemKey={getAttributeKey}
                            getItemTitle={getAttributeTitle}
                            isItemQuestionMarkEnabled={() => false}
                            isInverted={isInverted}
                            selectedItems={selection}
                            canSubmitOnKeyDown={!isApplyDisabled}
                            onApplyButtonClick={handleApply}
                            onSelect={onSelect}
                            searchString={searchString}
                            onSearch={setSearchString}
                            renderItem={(itemProps) => {
                                const group = mapAttributes.get(itemProps.item.attribute.id);
                                const driverCount = group?.significantDrivers.length ?? 0;
                                const count = driverCount > 0 ? `(${driverCount})` : "-";
                                const countAriaLabel =
                                    driverCount > 0
                                        ? intl.formatMessage(
                                              {
                                                  id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.countLabel",
                                              },
                                              { count: driverCount },
                                          )
                                        : intl.formatMessage({
                                              id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.noDrivers",
                                          });

                                return (
                                    <KdaAttributesSelectItem
                                        {...itemProps}
                                        right={
                                            <span
                                                className="gd-kda-attributes-dropdown__key_drivers"
                                                aria-label={countAriaLabel}
                                            >
                                                {count}
                                            </span>
                                        }
                                    />
                                );
                            }}
                            renderSearchBar={
                                isSearchBarVisible
                                    ? ({ onSearch, searchString: search, searchPlaceholder }) => (
                                          <InvertableSelectSearchBar
                                              onSearch={onSearch}
                                              searchString={search}
                                              searchPlaceholder={searchPlaceholder}
                                              isSmall
                                              onEscKeyPress={(e) => {
                                                  if (search) {
                                                      e.stopPropagation();
                                                  } else {
                                                      closeDropdown();
                                                  }
                                              }}
                                          />
                                      )
                                    : () => <div className="gd-kda-attributes-dropdown__no-search" />
                            }
                            renderActions={() => (
                                <div className="gd-kda-attributes-dropdown__subheader">
                                    <div className="gd-kda-attributes-dropdown__subheader__attribute">
                                        <FormattedMessage id="kdaDialog.dialog.keyDrives.overview.detail.table.attribute" />
                                    </div>
                                    <div
                                        className="gd-kda-attributes-dropdown__subheader__key_drivers"
                                        id={labelKeyDriversId}
                                    >
                                        <FormattedMessage id="kdaDialog.dialog.keyDrives.overview.detail.table.drivers" />
                                    </div>
                                </div>
                            )}
                        />
                        <div className="gd-kda-attributes-dropdown__actions">
                            <SeparatorLine />
                            <div className="gd-kda-attributes-dropdown__actions-buttons">
                                <UiButton
                                    variant="secondary"
                                    size="small"
                                    onClick={closeDropdown}
                                    label={intl.formatMessage({ id: "gs.list.cancel" })}
                                />
                                <UiButton
                                    variant="primary"
                                    size="small"
                                    isDisabled={isApplyDisabled}
                                    onClick={handleApply}
                                    label={intl.formatMessage({ id: "gs.list.apply" })}
                                />
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
