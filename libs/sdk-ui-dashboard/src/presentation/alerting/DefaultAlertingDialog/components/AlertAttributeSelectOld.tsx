// (C) 2019-2026 GoodData Corporation

import { useMemo, useRef, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    type IAttributeMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
} from "@gooddata/sdk-model";
import {
    Button,
    InvertableSelectSearchBar,
    Item,
    ItemsWrapper,
    Menu,
    Separator,
    SubMenu,
} from "@gooddata/sdk-ui-kit";

import { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "../../../constants/classes.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { type AlertAttribute } from "../../types.js";
import { type AttributeValue } from "../hooks/useAttributeValuesFromExecResults.js";
import { getSelectedCatalogAttribute, getSelectedCatalogAttributeValue } from "../utils/getters.js";

export interface IAlertAttributeSelectOldProps {
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

export function AlertAttributeSelectOld({
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
}: IAlertAttributeSelectOldProps) {
    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);

    const availableAttributes = useMemo(() => {
        return attributes.filter((attr) => attr.type === "attribute");
    }, [attributes]);

    const [searchString, setSearchString] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAttribute, setIsOpenAttribute] = useState<string | null>(null);

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

    const opened = Boolean(isOpen && !isResultLoading);

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
                <Menu
                    closeOnScroll={closeOnParentScroll}
                    toggler={
                        <div
                            ref={(item) => {
                                ref.current = item;
                            }}
                        >
                            <Button
                                id={id}
                                className={cx("gd-alert-attribute-select__button s-alert-attribute-select", {
                                    "is-active": opened,
                                })}
                                size="small"
                                disabled={isResultLoading}
                                variant="secondary"
                                iconLeft="gd-icon-attribute"
                                iconRight={`gd-icon-navigate${opened ? "up" : "down"}`}
                                onClick={() => {
                                    if (isResultLoading) {
                                        return;
                                    }
                                    setIsOpen(!isOpen);
                                    setIsOpenAttribute(null);
                                }}
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
                        </div>
                    }
                    togglerWrapperClassName="gd-alert-attribute-select__button_wrapper"
                    opened={opened}
                    onOpenedChange={({ opened }) => {
                        setIsOpen(opened);
                    }}
                    openAction={"click"}
                >
                    <ItemsWrapper
                        style={{
                            width: ref.current?.offsetWidth ?? 0,
                            zIndex: DASHBOARD_DIALOG_OVERS_Z_INDEX,
                        }}
                        className={IGNORED_CONFIGURATION_MENU_CLICK_CLASS}
                    >
                        <div className="gd-alert-attribute-select__submenu s-alert-attribute-menu-content">
                            <Item
                                className="gd-alert-attribute-select__menu-item_wrapper"
                                checked={!selectedAttribute}
                                onClick={(e) => {
                                    onAttributeChange(undefined, undefined);
                                    setIsOpen(false);
                                    setIsOpenAttribute(null);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item-value">
                                    {intl.formatMessage({ id: "insightAlert.config.selectAttribute" })}
                                </div>
                            </Item>
                            <Separator />
                            {availableAttributes.map((attribute, i) => {
                                const item = getSelectedCatalogAttribute(
                                    catalogAttributes,
                                    catalogDateDatasets,
                                    attribute,
                                );

                                if (!item) {
                                    return null;
                                }

                                const isSelected = selectedAttribute?.id === item.id;
                                const values = getAttributeValues(item);

                                return (
                                    <SubMenu
                                        key={i}
                                        toggler={
                                            <Item
                                                checked={isSelected}
                                                subMenu
                                                className="gd-alert-attribute-select__menu-item_wrapper"
                                            >
                                                <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item">
                                                    {item.title ||
                                                        `(${intl.formatMessage({ id: "empty_value" })})`}
                                                </div>
                                            </Item>
                                        }
                                        openAction={"click"}
                                        opened={
                                            isOpenAttribute === attribute.attribute.attribute.localIdentifier
                                        }
                                        onOpenedChange={({ opened }) => {
                                            setIsOpenAttribute(
                                                opened ? attribute.attribute.attribute.localIdentifier : null,
                                            );
                                            setSearchString("");
                                        }}
                                    >
                                        <ItemsWrapper
                                            style={{
                                                zIndex: DASHBOARD_DIALOG_OVERS_Z_INDEX + 1,
                                            }}
                                            className={IGNORED_CONFIGURATION_MENU_CLICK_CLASS}
                                        >
                                            <div
                                                className={cx(
                                                    "gd-alert-attribute-select__submenu-content",
                                                    "s-alert-attribute-submenu-content",
                                                )}
                                            >
                                                {values.length > 5 && (
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
                                                )}
                                                <Item
                                                    className="gd-alert-attribute-select__menu-item_wrapper"
                                                    checked={Boolean(isSelected && !selectedAttributeValue)}
                                                    onClick={(e) => {
                                                        onAttributeChange(attribute, undefined);
                                                        setIsOpen(false);
                                                        setIsOpenAttribute(null);
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
                                                    {values
                                                        .filter((item) => {
                                                            if (searchString) {
                                                                return item.title
                                                                    .toLowerCase()
                                                                    .includes(searchString.toLowerCase());
                                                            }
                                                            return true;
                                                        })
                                                        .map((value, j) => (
                                                            <Item
                                                                key={j}
                                                                checked={Boolean(
                                                                    isSelected &&
                                                                        value.value ===
                                                                            selectedAttributeValue?.value,
                                                                )}
                                                                className="gd-alert-attribute-select__menu-item_wrapper"
                                                                onClick={(e) => {
                                                                    onAttributeChange(attribute, value);
                                                                    setIsOpen(false);
                                                                    setIsOpenAttribute(null);
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item-value">
                                                                    {(value.title ?? value.name) ||
                                                                        `(${intl.formatMessage({
                                                                            id: "empty_value",
                                                                        })})`}
                                                                </div>
                                                            </Item>
                                                        ))}
                                                </div>
                                            </div>
                                        </ItemsWrapper>
                                    </SubMenu>
                                );
                            })}
                        </div>
                    </ItemsWrapper>
                </Menu>
            </div>
        </>
    );
}
