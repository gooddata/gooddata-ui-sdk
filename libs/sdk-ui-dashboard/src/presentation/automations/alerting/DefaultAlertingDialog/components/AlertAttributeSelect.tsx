// (C) 2019-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type IAttributeMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownButton,
    type IUiMenuInteractiveItem,
    type IUiMenuItem,
    InvertableSelectSearchBar,
    Item,
    Separator,
    UiMenu,
} from "@gooddata/sdk-ui-kit";

import { type AlertAttribute } from "../../types.js";
import { type AttributeValue } from "../hooks/useAttributeValuesFromExecResults.js";
import { getSelectedCatalogAttribute, getSelectedCatalogAttributeValue } from "../utils/getters.js";

export interface IAlertAttributeSelectProps {
    id: string;
    disabled?: boolean;
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
    content: undefined;
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
    type: "separator",
    id,
});

interface IAttributeValuesSearchContentProps {
    attribute: AlertAttribute;
    values: AttributeValue[];
    isSelected: boolean;
    selectedAttributeValue: AttributeValue | undefined;
    onAttributeChange: (attribute: AlertAttribute | undefined, value: AttributeValue | undefined) => void;
    onClose: () => void;
}

function AttributeValuesSearchContent({
    attribute,
    values,
    isSelected,
    selectedAttributeValue,
    onAttributeChange,
    onClose,
}: IAttributeValuesSearchContentProps) {
    const intl = useIntl();
    const [searchString, setSearchString] = useState("");

    const filteredValues = useMemo(() => {
        if (!searchString) {
            return values;
        }

        const loweredSearch = searchString.toLowerCase();
        return values.filter((item) => (item.title ?? item.name ?? "").toLowerCase().includes(loweredSearch));
    }, [searchString, values]);

    return (
        <div
            className={cx("gd-alert-attribute-select__submenu-content", "s-alert-attribute-submenu-content")}
        >
            <div>
                <InvertableSelectSearchBar
                    onSearch={setSearchString}
                    searchString={searchString}
                    searchPlaceholder={intl.formatMessage({
                        id: "attributesDropdown.placeholder",
                    })}
                    className="gd-alert-attribute-select__menu-item_search"
                />
            </div>
            <Item
                className="gd-alert-attribute-select__menu-item_wrapper"
                checked={Boolean(isSelected && !selectedAttributeValue)}
                onClick={(e) => {
                    onAttributeChange(attribute, undefined);
                    onClose();
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item-value">
                    {intl.formatMessage({
                        id: "insightAlert.config.selectAttribute",
                    })}{" "}
                    ({values.length})
                </div>
            </Item>
            <Separator />
            <div className="gd-alert-attribute-select__menu-item__values">
                {filteredValues.map((value, index) => (
                    <Item
                        key={index}
                        checked={Boolean(isSelected && value.value === selectedAttributeValue?.value)}
                        className="gd-alert-attribute-select__menu-item_wrapper"
                        onClick={(e) => {
                            onAttributeChange(attribute, value);
                            onClose();
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item-value">
                            {(value.title ?? value.name) || `(${intl.formatMessage({ id: "empty_value" })})`}
                        </div>
                    </Item>
                ))}
            </div>
        </div>
    );
}

export function AlertAttributeSelect({
    id,
    disabled,
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
}: IAlertAttributeSelectProps) {
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

            const isSelected = Boolean(hasDisplayForm);

            if (values.length > 5) {
                attributeItems.push({
                    type: "content" as const,
                    id: `attribute-${item.id}`,
                    stringTitle: item.title || intl.formatMessage({ id: "empty_value" }),
                    data: undefined,
                    Component: ({ onClose }) => (
                        <AttributeValuesSearchContent
                            attribute={attribute}
                            values={values}
                            isSelected={isSelected}
                            selectedAttributeValue={selectedAttributeValue}
                            onAttributeChange={onAttributeChange}
                            onClose={onClose}
                        />
                    ),
                });
                continue;
            }

            const subItems: IUiMenuItem<IAttributeMenuData>[] = [
                createInteractiveItem(
                    `all-${item.id}`,
                    `${accessibilityAriaLabel} (${values.length})`,
                    attribute,
                    undefined,
                    Boolean(hasDisplayForm && !selectedAttributeValue),
                ),
                createSeparator(`separator-${item.id}`),
                ...values.map((value) =>
                    createInteractiveItem(
                        `value-${value.value}`,
                        (value.title ?? value.name) || intl.formatMessage({ id: "empty_value" }),
                        attribute,
                        value,
                        Boolean(hasDisplayForm && selectedAttributeValue?.value === value.value),
                    ),
                ),
            ];

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
                accessibilityAriaLabel,
                undefined,
                undefined,
                Boolean(!selectedAttribute && !selectedAttributeValue),
            ),
            // Separator
            createSeparator("top-separator"),
            // Attribute items
            ...attributeItems,
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        availableAttributes,
        catalogAttributes,
        catalogDateDatasets,
        getAttributeValues,
        intl,
        onAttributeChange,
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
                    autofocusOnOpen
                    closeOnParentScroll={closeOnParentScroll}
                    renderButton={({ isOpen, toggleDropdown, buttonRef, dropdownId }) => {
                        const buttonValue = selectedAttribute
                            ? `${selectedAttribute?.title} / ${
                                  selectedAttributeValue
                                      ? (selectedAttributeValue.title ?? selectedAttributeValue.name) ||
                                        `(${intl.formatMessage({ id: "empty_value" })})`
                                      : accessibilityAriaLabel
                              }`
                            : accessibilityAriaLabel;

                        return (
                            <DropdownButton
                                id={id}
                                className={cx("gd-alert-attribute-select__button", {
                                    "is-active": isOpen,
                                })}
                                value={buttonValue}
                                iconLeft="gd-icon-attribute"
                                onClick={() => {
                                    if (!isResultLoading && !disabled) {
                                        toggleDropdown();
                                    }
                                }}
                                disabled={isResultLoading || disabled}
                                buttonRef={buttonRef as MutableRefObject<HTMLElement>}
                                dropdownId={dropdownId}
                                isOpen={isOpen}
                                accessibilityConfig={{
                                    ariaExpanded: isOpen,
                                    popupType: "menu",
                                }}
                            />
                        );
                    }}
                    renderBody={({ closeDropdown, ariaAttributes }) => (
                        <UiMenu<IAttributeMenuData>
                            items={uiMenuItems}
                            onSelect={(item) => {
                                handleUiMenuSelect(item);
                            }}
                            shouldCloseOnSelect
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            dataTestId="s-alert-attribute-select-list"
                            size={"small"}
                        />
                    )}
                    alignPoints={[{ align: "bl tl" }]}
                />
            </div>
        </>
    );
}
