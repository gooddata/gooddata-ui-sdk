// (C) 2022 GoodData Corporation

import React, { useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "../ShortenedText";
import { getColorsPreviewFromTheme } from "./utils";
import { ColorPreview, StylingPickerItem } from "../Dialog";
import { IOnOpenedChangeParams, Menu } from "../Menu";
import { Item, ItemsWrapper, Separator } from "../List";
import { Button } from "../Button";
import { Bubble, BubbleHoverTrigger } from "../Bubble";

interface IStylingPickerListItemProps {
    item: StylingPickerItem;
    isSelected: boolean;
    onClick: (ref: ObjRef) => void;
    onEdit?: (item: StylingPickerItem) => void;
    onDelete?: (ref: ObjRef) => void;
}

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export const StylingPickerListItem: React.FC<IStylingPickerListItemProps> = ({
    item,
    isSelected,
    onClick,
    onEdit,
    onDelete,
}) => {
    const intl = useIntl();

    const { title, ref } = item;
    const colorsPreview = getColorsPreviewFromTheme(item);

    const [opened, setOpened] = useState(false);

    const onOpenedChange = ({ opened }: IOnOpenedChangeParams) => setOpened(opened);
    const toggleMenu = () => setOpened(!opened);

    const isMenuVisible = onEdit || onDelete;

    return (
        <div
            className={cx(
                "gd-styling-picker-list-item",
                "s-styling-picker-list-item",
                `s-styling-picker-list-item-${stringUtils.simplifyText(title)}`,
                {
                    "is-selected": isSelected,
                },
            )}
        >
            <label
                className="input-radio-label gd-styling-picker-list-item-content"
                onClick={() => onClick(ref)}
            >
                <input type="radio" className="input-radio" readOnly={true} checked={isSelected} />
                <ColorPreview className="gd-styling-picker-list-item-colors" colors={colorsPreview} />
                <span className="input-label-text gd-styling-picker-list-item-text">
                    <ShortenedText
                        className="gd-styling-picker-list-item-text-shortened"
                        tooltipAlignPoints={TEXT_TOOLTIP_ALIGN_POINTS}
                    >
                        {title}
                    </ShortenedText>
                </span>
            </label>
            {isMenuVisible && (
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
                            onClick={() => onDelete?.(ref)}
                            disabled={isSelected}
                        >
                            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                                {intl.formatMessage({ id: "stylingPicker.item.delete" })}
                                {isSelected && (
                                    <Bubble className="bubble-primary">
                                        {intl.formatMessage({ id: "stylingPicker.item.delete.tooltip" })}
                                    </Bubble>
                                )}
                            </BubbleHoverTrigger>
                        </Item>
                    </ItemsWrapper>
                </Menu>
            )}
        </div>
    );
};
