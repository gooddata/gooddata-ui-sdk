// (C) 2020-2025 GoodData Corporation

import { MouseEvent, memo, useCallback, useMemo } from "react";

import cx from "classnames";

import { ISeparators } from "@gooddata/sdk-ui";
import { stringUtils } from "@gooddata/util";

import { FormattedPreview } from "../customFormatDialog/shared/FormattedPreview.js";
import { IFormatPreset } from "../typings.js";

interface IMeasureNumberFormatDropdownItemProps {
    preset: IFormatPreset;
    separators: ISeparators;
    onClick: (selectedPreset: IFormatPreset) => void;
    isSelected?: boolean;
}

export const PresetsDropdownItem = memo(function PresetsDropdownItem({
    preset,
    separators,
    onClick,
    isSelected = false,
}: IMeasureNumberFormatDropdownItemProps) {
    const { localIdentifier, name, previewNumber, format } = preset;

    const className = useMemo(
        () =>
            cx(
                "gd-list-item",
                "gd-format-preset",
                `s-format-preset-${localIdentifier}`,
                `s-format-preset-name-${stringUtils.simplifyText(name)}`,
                {
                    "is-selected": isSelected,
                },
            ),
        [localIdentifier, name, isSelected],
    );

    const handleOnClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            onClick(preset);
            e.preventDefault();
        },
        [onClick, preset],
    );

    return (
        <div className={className} onClick={handleOnClick}>
            <span title={name} className="gd-format-preset-name gd-list-item-shortened">
                {name}
            </span>
            {previewNumber !== null && format !== null && (
                <FormattedPreview
                    previewNumber={previewNumber}
                    format={format}
                    separators={separators}
                    colors={false}
                    className={"gd-format-preset-preview"}
                />
            )}
        </div>
    );
});
