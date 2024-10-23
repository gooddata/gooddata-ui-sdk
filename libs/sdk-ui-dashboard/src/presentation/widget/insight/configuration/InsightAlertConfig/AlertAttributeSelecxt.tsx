// (C) 2019-2024 GoodData Corporation
import React, { useRef, useState } from "react";
import {
    Button,
    Menu,
    ItemsWrapper,
    Item,
    SubMenu,
    Separator,
    InvertableSelectSearchBar,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { useIntl } from "react-intl";
import { areObjRefsEqual, IAttributeMetadataObject } from "@gooddata/sdk-model";

import { AlertAttribute } from "../../types.js";
import {
    DASHBOARD_DIALOG_OVERS_Z_INDEX,
    IGNORED_CONFIGURATION_MENU_CLICK_CLASS,
} from "../../../../constants/index.js";
import { IExecutionResultEnvelope } from "../../../../../model/index.js";

import { getAttributeTitle } from "./utils.js";
import { useAttributeValuesFromExecResults } from "./hooks/useAttributeValuesFromExecResults.js";

export interface IAlertAttributeSelectProps {
    execResult: IExecutionResultEnvelope | undefined;
    selectedAttribute: AlertAttribute | undefined;
    selectedValue: string | undefined;
    onAttributeChange: (attribute: AlertAttribute | undefined, value: string | undefined) => void;
    attributes: AlertAttribute[];
    catalogAttributes: IAttributeMetadataObject[];
}

export const AlertAttributeSelect = ({
    execResult,
    selectedAttribute,
    selectedValue,
    onAttributeChange,
    attributes,
    catalogAttributes,
}: IAlertAttributeSelectProps) => {
    const intl = useIntl();
    const ref = useRef<HTMLElement | null>(null);

    const selectedAttr =
        selectedAttribute && getSelectedCatalogAttribute(catalogAttributes, selectedAttribute);

    const [searchString, setSearchString] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAttribute, setIsOpenAttribute] = useState<string | null>(null);

    const { isResultLoading, getAttributeValues } = useAttributeValuesFromExecResults(execResult);
    const opened = Boolean(isOpen && !isResultLoading);

    return (
        <div className="gd-alert-attribute-select">
            <Menu
                toggler={
                    <div
                        ref={(item) => {
                            ref.current = item;
                        }}
                    >
                        <Button
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
                                    {selectedAttr?.title}
                                    <span>
                                        {"\u00A0"}/{"\u00A0"}
                                    </span>
                                    {selectedValue
                                        ? selectedValue
                                        : intl.formatMessage({ id: "insightAlert.config.selectAttribute" })}
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
                            checked={!selectedAttr}
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
                        {attributes.map((attribute, i) => {
                            const item = getSelectedCatalogAttribute(catalogAttributes, attribute);

                            if (!item) {
                                return null;
                            }

                            const isSelected = selectedAttr?.id === item.id;
                            const values = getAttributeValues(item);

                            return (
                                <SubMenu
                                    key={i}
                                    toggler={
                                        <Item
                                            checked={isSelected}
                                            subMenu={true}
                                            className="gd-alert-attribute-select__menu-item_wrapper"
                                        >
                                            <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item">
                                                {item.title}
                                            </div>
                                        </Item>
                                    }
                                    openAction={"click"}
                                    opened={isOpenAttribute === attribute.attribute.attribute.localIdentifier}
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
                                        <div className="s-alert-attribute-submenu-content">
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
                                                checked={Boolean(isSelected && !selectedValue)}
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
                                                                isSelected && value.value === selectedValue,
                                                            )}
                                                            className="gd-alert-attribute-select__menu-item_wrapper"
                                                            onClick={(e) => {
                                                                onAttributeChange(attribute, value.value);
                                                                setIsOpen(false);
                                                                setIsOpenAttribute(null);
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <div className="gd-alert-attribute-select__menu-item s-menu-alert-attribute-item-value">
                                                                {value.title ?? value.name}
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
    );
};

function getSelectedCatalogAttribute(
    catalogAttributes: IAttributeMetadataObject[],
    attribute: AlertAttribute,
) {
    const item = catalogAttributes.find((a) => {
        const self = areObjRefsEqual(a.ref, attribute.attribute.attribute.displayForm);
        const rf = a.displayForms.find((df) =>
            areObjRefsEqual(df.ref, attribute.attribute.attribute.displayForm),
        );

        return self || rf;
    });

    if (!item) {
        return null;
    }

    return {
        ...item,
        title: item?.title ?? getAttributeTitle(attribute.attribute),
    };
}
