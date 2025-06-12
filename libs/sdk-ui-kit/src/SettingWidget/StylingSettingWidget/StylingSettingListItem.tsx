// (C) 2022 GoodData Corporation

import React, { useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "../../ShortenedText/index.js";
import { ColorPreview, IStylingPickerItem, StylingPickerItemContent } from "../../Dialog/index.js";
import { IOnOpenedChangeParams, Menu } from "../../Menu/index.js";
import { Item, ItemsWrapper, Separator } from "../../List/index.js";
import { Button } from "../../Button/index.js";
import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import noop from "lodash/noop.js";

interface IStylingSettingListItemProps<T> {
    item: IStylingPickerItem<T>;
    itemToColorPreview: (itemContent: T) => string[];
    isSelected: boolean;
    isDeletable?: boolean;
    onClick: (ref: ObjRef) => void;
    onEdit?: (item: IStylingPickerItem<T>) => void;
    onDelete?: (ref: ObjRef) => void;
    onMenuToggle?: (ref: ObjRef) => void;
}

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export const StylingSettingListItem = <T extends StylingPickerItemContent>({
    item,
    itemToColorPreview,
    isSelected,
    isDeletable,
    onClick,
    onEdit,
    onDelete,
    onMenuToggle = noop,
}: IStylingSettingListItemProps<T>): JSX.Element => {
    const intl = useIntl();

    const { name, ref, content } = item;
    const colorsPreview = itemToColorPreview(content);

    const [opened, setOpened] = useState(false);

    const onOpenedChange = ({ opened }: IOnOpenedChangeParams) => setOpened(opened);
    const toggleMenu = () => {
        onMenuToggle(ref);
        setOpened(!opened);
    };

    const isMenuVisible = onEdit || onDelete;

    return (
        <div
            className={cx(
                "gd-styling-picker-list-item",
                "s-styling-picker-list-item",
                `s-styling-picker-list-item-${stringUtils.simplifyText(name)}`,
                {
                    "is-selected": isSelected,
                },
            )}
        >
            <label className="input-radio-label gd-styling-picker-list-item-content">
                <input
                    aria-label={stringUtils.simplifyText(name)}
                    type="radio"
                    className="input-radio"
                    readOnly={true}
                    checked={isSelected}
                    onClick={() => onClick(ref)}
                />
                <ColorPreview className="gd-styling-picker-list-item-colors" colors={colorsPreview} />
                <span className="input-label-text gd-styling-picker-list-item-text">
                    <ShortenedText
                        className="gd-styling-picker-list-item-text-shortened"
                        tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                    >
                        {name}
                    </ShortenedText>
                </span>
            </label>
            {isMenuVisible ? (
                <Menu
                    toggler={
                        <Button
                            value="..."
                            className="gd-button-link-dimmed gd-styling-item-menu s-menu-toggle"
                            onClick={toggleMenu}
                        />
                    }
                    opened={opened}
                    openAction={"click"}
                    closeOnScroll={true}
                    onOpenedChange={onOpenedChange}
                >
                    <ItemsWrapper className="s-styling-item-menu-items" smallItemsSpacing={true}>
                        <Item className="s-styling-item-menu-item-edit" onClick={() => onEdit?.(item)}>
                            {intl.formatMessage({ id: "stylingPicker.item.edit" })}
                        </Item>
                        <Separator />
                        <Item
                            className="s-styling-item-menu-item-delete"
                            onClick={() => isDeletable && onDelete?.(ref)}
                            disabled={!isDeletable}
                        >
                            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                                {intl.formatMessage({ id: "stylingPicker.item.delete" })}
                                {!isDeletable ? (
                                    <Bubble className="bubble-primary">
                                        {intl.formatMessage({ id: "stylingPicker.item.delete.tooltip" })}
                                    </Bubble>
                                ) : null}
                            </BubbleHoverTrigger>
                        </Item>
                    </ItemsWrapper>
                </Menu>
            ) : null}
        </div>
    );
};
