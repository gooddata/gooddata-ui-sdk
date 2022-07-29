// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";
import { ObjRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import { ShortenedText } from "../ShortenedText";
import { getColorsPreviewFromThemeMetadataObject } from "./utils";
import { ColorPreview, StylingPickerItem } from "../Dialog";

interface IStylingPickerListItemProps {
    item: StylingPickerItem;
    isSelected: boolean;
    onClick: (ref: ObjRef) => void;
}

const TEXT_TOOLTIP_ALIGN_POINTS = [
    { align: "tc bc", offset: { x: 0, y: 0 } },
    { align: "bc tc", offset: { x: 0, y: 0 } },
];

export const StylingPickerListItem: React.FC<IStylingPickerListItemProps> = ({
    item,
    isSelected,
    onClick,
}) => {
    const { title, ref } = item;
    const colorsPreview = getColorsPreviewFromThemeMetadataObject(item);

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
        </div>
    );
};
