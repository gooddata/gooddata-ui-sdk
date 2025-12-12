// (C) 2022-2025 GoodData Corporation

import { type ReactElement, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import { Button } from "../../Button/index.js";
import { ColorPreview, type IStylingPickerItem, type StylingPickerItemContent } from "../../Dialog/index.js";
import { Item, ItemsWrapper, Separator } from "../../List/index.js";
import { type IOnOpenedChangeParams, Menu } from "../../Menu/index.js";
import { ShortenedText } from "../../ShortenedText/index.js";

interface IStylingSettingListItemProps<T extends StylingPickerItemContent> {
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

export function StylingSettingListItem<T extends StylingPickerItemContent>({
    item,
    itemToColorPreview,
    isSelected,
    isDeletable,
    onClick,
    onEdit,
    onDelete,
    onMenuToggle = () => {},
}: IStylingSettingListItemProps<T>): ReactElement {
    const intl = useIntl();

    const { name, ref, content } = item;
    const colorsPreview = itemToColorPreview(content);

    const [opened, setOpened] = useState(false);

    const onOpenedChange = ({ opened }: IOnOpenedChangeParams) => setOpened(opened);
    const toggleMenu = () => {
        if (ref) {
            onMenuToggle?.(ref);
        }
        setOpened(!opened);
    };

    const isMenuVisible = onEdit || onDelete;

    return (
        <div
            className={cx(
                "gd-styling-picker-list-item",
                "s-styling-picker-list-item",
                `s-styling-picker-list-item-${stringUtils.simplifyText(name ?? "")}`,
                {
                    "is-selected": isSelected,
                },
            )}
        >
            <label className="input-radio-label gd-styling-picker-list-item-content">
                <input
                    aria-label={stringUtils.simplifyText(name ?? "")}
                    type="radio"
                    className="input-radio"
                    readOnly
                    checked={isSelected}
                    onClick={() => ref && onClick(ref)}
                />
                <ColorPreview className="gd-styling-picker-list-item-colors" colors={colorsPreview} />
                <span className="input-label-text gd-styling-picker-list-item-text">
                    <ShortenedText
                        className="gd-styling-picker-list-item-text-shortened"
                        tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                    >
                        {name ?? ""}
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
                    closeOnScroll
                    onOpenedChange={onOpenedChange}
                >
                    <ItemsWrapper className="s-styling-item-menu-items" smallItemsSpacing>
                        <Item className="s-styling-item-menu-item-edit" onClick={() => onEdit?.(item)}>
                            {intl.formatMessage({ id: "stylingPicker.item.edit" })}
                        </Item>
                        <Separator />
                        <Item
                            className="s-styling-item-menu-item-delete"
                            onClick={() => isDeletable && ref && onDelete?.(ref)}
                            disabled={!isDeletable}
                        >
                            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                                {intl.formatMessage({ id: "stylingPicker.item.delete" })}
                                {isDeletable ? null : (
                                    <Bubble className="bubble-primary">
                                        {intl.formatMessage({ id: "stylingPicker.item.delete.tooltip" })}
                                    </Bubble>
                                )}
                            </BubbleHoverTrigger>
                        </Item>
                    </ItemsWrapper>
                </Menu>
            ) : null}
        </div>
    );
}
