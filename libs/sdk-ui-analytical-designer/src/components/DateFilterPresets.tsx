// (C) 2007-2026 GoodData Corporation

import { type ElementType } from "react";

import classNames from "classnames";
import { partial } from "lodash-es";
import { useIntl } from "react-intl";

import { DecoratedPresetItem, type IDecoratedPresetItem, arePresetsEqual } from "../models/preset_item.js";

export type DateFilterPresetsProps = {
    tagName?: ElementType;
    className?: string;
    selectedPreset?: IDecoratedPresetItem;
    presets: IDecoratedPresetItem[];
    onSelectPreset: (preset: IDecoratedPresetItem) => void;
};

export function DateFilterPresets({
    tagName = "div",
    className = "",
    selectedPreset = {} as IDecoratedPresetItem,
    presets,
    onSelectPreset,
}: DateFilterPresetsProps) {
    const intl = useIntl();

    const getPresetClassNames = (preset: IDecoratedPresetItem) => {
        const isSelected = arePresetsEqual(selectedPreset, preset);

        return classNames("gd-list-item", "mouseoverTrigger", "filter-picker-text", preset.seleniumClass, {
            "s-is-selected": isSelected,
            "is-selected": isSelected,
        });
    };

    const Tag = tagName;

    if (!presets?.length) {
        return null;
    }

    return (
        <Tag className={className}>
            {presets.map((preset, idx: number) => {
                if (preset.header) {
                    return (
                        <div key={idx} className="filter-picker-header">
                            {intl.formatMessage({ id: preset.header })}
                        </div>
                    );
                }
                const onClick = partial(onSelectPreset, preset);
                return (
                    <div key={idx} className={getPresetClassNames(preset)} onClick={onClick}>
                        {DecoratedPresetItem.getTitle(preset, intl)}
                    </div>
                );
            })}
        </Tag>
    );
}
