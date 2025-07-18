// (C) 2020-2025 GoodData Corporation
import { memo } from "react";
import cx from "classnames";
import { ISeparators } from "@gooddata/sdk-ui";
import { stringUtils } from "@gooddata/util";

import { IFormatPreset } from "../typings.js";
import { FormattedPreview } from "../customFormatDialog/shared/FormattedPreview.js";

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

    const className = cx(
        "gd-list-item",
        "gd-format-preset",
        `s-format-preset-${localIdentifier}`,
        `s-format-preset-name-${stringUtils.simplifyText(name)}`,
        {
            "is-selected": isSelected,
        },
    );

    const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick(preset);
        e.preventDefault();
    };

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
