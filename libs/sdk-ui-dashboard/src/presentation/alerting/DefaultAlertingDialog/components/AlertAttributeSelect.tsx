// (C) 2019-2025 GoodData Corporation
import React, { useMemo, useCallback } from "react";
import {
    Button,
    UiMenu,
    IUiMenuItem,
    IUiMenuInteractiveItem,
    IUiMenuInteractiveItemProps,
    Dropdown,
    DefaultUiMenuInteractiveItem,
    IUiMenuStaticItemProps,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import {
    areObjRefsEqual,
    IAttributeMetadataObject,
    ICatalogAttribute,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";

import { AlertAttribute } from "../../types.js";

import { AttributeValue } from "../hooks/useAttributeValuesFromExecResults.js";
import { getSelectedCatalogAttribute, getSelectedCatalogAttributeValue } from "../utils/getters.js";

export interface IAlertAttributeSelectProps {
    id: string;
    selectedAttribute: AlertAttribute | undefined;
    selectedValue: string | null | undefined;
    onAttributeChange: (attribute: AlertAttribute | undefined, value: AttributeValue | undefined) => void;
    attributes: AlertAttribute[];
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    getAttributeValues: (attr: IAttributeMetadataObject) => AttributeValue[];
    isResultLoading?: boolean;
    showLabel?: boolean;
    closeOnParentScroll?: boolean;
}

interface IAttributeMenuItemData {
    attribute: AlertAttribute | undefined;
    value: AttributeValue | undefined;
    isSelected: boolean;
}

interface IAttributeMenuData {
    interactive: IAttributeMenuItemData;
}

const createInteractiveItem = (
    id: string,
    title: string,
    attribute: AlertAttribute | undefined,
    value: AttributeValue | undefined,
    isSelected: boolean,
    subItems?: IUiMenuItem<IAttributeMenuData>[],
): IUiMenuItem<IAttributeMenuData> => ({
    type: "interactive" as const,
    id,
    stringTitle: title,
    isSelected,
    data: {
        attribute,
        value,
        isSelected,
    },
    ...(subItems && { subItems }),
});

const createSeparator = (id: string): IUiMenuItem<IAttributeMenuData> => ({
    type: "static" as const,
    id,
    data: {},
});

export const CustomInteractiveItem = ({
    item,
    isFocused,
    onSelect,
}: IUiMenuInteractiveItemProps<IAttributeMenuData>): React.ReactNode => {
    return (
        <DefaultUiMenuInteractiveItem item={item} isFocused={isFocused} onSelect={onSelect} size="small" />
    );
};

const CustomStaticItem = ({ item: _item }: IUiMenuStaticItemProps<IAttributeMenuData>): React.ReactNode => {
    return <div className="gd-alert-attribute-select__dropdown-separator" />;
};

export const AlertAttributeSelect = ({
    id,
    selectedAttribute: selectedAttributeProp,
    getAttributeValues,
    isResultLoading,
    selectedValue,
    onAttributeChange,
    attributes,
    catalogAttributes,
    catalogDateDatasets,
    showLabel = true,
    closeOnParentScroll,
}: IAlertAttributeSelectProps) => {
    const intl = useIntl();

    const availableAttributes = useMemo(() => {
        return attributes.filter((attr) => attr.type === "attribute");
    }, [attributes]);

    const selectedAttribute = useMemo(() => {
        return (
            selectedAttributeProp &&
            getSelectedCatalogAttribute(catalogAttributes, catalogDateDatasets, selectedAttributeProp)
        );
    }, [selectedAttributeProp, catalogAttributes, catalogDateDatasets]);

    const selectedAttributeValue = useMemo(
        () => getSelectedCatalogAttributeValue(selectedAttribute, getAttributeValues, selectedValue),
        [selectedAttribute, getAttributeValues, selectedValue],
    );

    const accessibilityAriaLabel = intl.formatMessage({ id: "insightAlert.config.selectAttribute" });

    const uiMenuItems: IUiMenuItem<IAttributeMenuData>[] = useMemo(() => {
        // Create menu items based on available attributes
        const attributeItems: IUiMenuItem<IAttributeMenuData>[] = [];

        for (const attribute of availableAttributes) {
            const item = getSelectedCatalogAttribute(catalogAttributes, catalogDateDatasets, attribute);

            if (!item) {
                continue;
            }

            const values = getAttributeValues(item);
            const hasDisplayForm = selectedAttribute?.displayForms.some((df) =>
                areObjRefsEqual(df.ref, attribute.attribute.attribute.displayForm),
            );

            // Create sub-items for attribute values
            const subItems: IUiMenuItem<IAttributeMenuData>[] = [
                // "All" option
                createInteractiveItem(
                    `all-${item.id}`,
                    `${intl.formatMessage({ id: "insightAlert.config.selectAttribute" })} (${values.length})`,
                    attribute,
                    undefined,
                    Boolean(hasDisplayForm && !selectedAttributeValue),
                ),
                // Separator after All option
                createSeparator(`separator-${item.id}`),
            ];

            // Add individual value items
            for (const value of values) {
                subItems.push(
                    createInteractiveItem(
                        `value-${value.value}`,
                        (value.title ?? value.name) || intl.formatMessage({ id: "empty_value" }),
                        attribute,
                        value,
                        Boolean(hasDisplayForm && selectedAttributeValue?.value === value.value),
                    ),
                );
            }

            // Check if any child is selected to determine parent selection state
            const hasSelectedChild = subItems.some(
                (item) => item.type === "interactive" && "isSelected" in item && item.isSelected,
            );

            // Create attribute item with submenu
            attributeItems.push(
                createInteractiveItem(
                    `attribute-${item.id}`,
                    item.title || intl.formatMessage({ id: "empty_value" }),
                    attribute,
                    undefined,
                    Boolean(
                        (selectedAttribute &&
                            areObjRefsEqual(
                                selectedAttribute.ref,
                                attribute.attribute.attribute.displayForm,
                            )) ||
                            hasSelectedChild,
                    ),
                    subItems,
                ),
            );
        }

        // Create the full menu items array
        return [
            // "Select Attribute" option
            createInteractiveItem(
                "clear",
                intl.formatMessage({ id: "insightAlert.config.selectAttribute" }),
                undefined,
                undefined,
                Boolean(!selectedAttribute && !selectedAttributeValue),
            ),
            // Separator
            createSeparator("top-separator"),
            // Attribute items
            ...attributeItems,
        ];
    }, [
        availableAttributes,
        catalogAttributes,
        catalogDateDatasets,
        getAttributeValues,
        intl,
        selectedAttribute,
        selectedAttributeValue,
    ]);

    const handleUiMenuSelect = useCallback(
        (item: IUiMenuInteractiveItem<IAttributeMenuData>) => {
            onAttributeChange(item.data.attribute, item.data.value);
        },
        [onAttributeChange],
    );

    // if there are no attributes, return null
    if (availableAttributes.length === 0) {
        return null;
    }

    return (
        <>
            {showLabel ? (
                <label htmlFor={id} className="gd-edit-alert__measure-label">
                    <FormattedMessage id="insightAlert.config.for" />
                </label>
            ) : null}
            <div className="gd-alert-attribute-select">
                <Dropdown
                    autofocusOnOpen={true}
                    closeOnParentScroll={closeOnParentScroll}
                    renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => (
                        <Button
                            id={id}
                            className={cx("gd-alert-attribute-select__button", {
                                "is-active": isOpen,
                            })}
                            size="small"
                            disabled={isResultLoading}
                            variant="secondary"
                            iconLeft="gd-icon-attribute"
                            iconRight={`gd-icon-navigate${isOpen ? "up" : "down"}`}
                            onClick={() => {
                                if (!isResultLoading) {
                                    toggleDropdown();
                                }
                            }}
                            accessibilityConfig={{
                                role: "button",
                                popupId: dropdownId,
                                isExpanded: isOpen,
                                ariaLabel: accessibilityAriaLabel,
                            }}
                            ref={buttonRef as React.MutableRefObject<HTMLButtonElement>}
                        >
                            {selectedAttribute ? (
                                <span>
                                    {selectedAttribute?.title}
                                    <span>
                                        {"\u00A0"}/{"\u00A0"}
                                    </span>
                                    {selectedAttributeValue
                                        ? (selectedAttributeValue.title ?? selectedAttributeValue.name) ||
                                          `(${intl.formatMessage({ id: "empty_value" })})`
                                        : intl.formatMessage({
                                              id: "insightAlert.config.selectAttribute",
                                          })}
                                </span>
                            ) : (
                                <>{intl.formatMessage({ id: "insightAlert.config.selectAttribute" })}</>
                            )}
                        </Button>
                    )}
                    renderBody={({ closeDropdown, ariaAttributes }) => (
                        <UiMenu<IAttributeMenuData>
                            items={uiMenuItems}
                            onSelect={(item) => {
                                handleUiMenuSelect(item);
                            }}
                            shouldCloseOnSelect={true}
                            onClose={closeDropdown}
                            InteractiveItem={CustomInteractiveItem}
                            StaticItem={CustomStaticItem}
                            ariaAttributes={ariaAttributes}
                            className="s-alert-attribute-select-list"
                            dataTestId="s-alert-attribute-select-list"
                        />
                    )}
                    alignPoints={[{ align: "bl tl" }]}
                />
            </div>
        </>
    );
};
