// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ISeparators } from "@gooddata/sdk-ui";
import { string as stringUtils } from "@gooddata/js-utils";

import { IFormatPreset } from "../typings";
import { FormattedPreview } from "../customFormatDialog/shared/FormattedPreview";

interface IMeasureNumberFormatDropdownItemProps {
    preset: IFormatPreset;
    separators: ISeparators;
    onClick: (selectedPreset: IFormatPreset) => void;
    isSelected?: boolean;
}

export class PresetsDropdownItem extends React.PureComponent<IMeasureNumberFormatDropdownItemProps> {
    public static defaultProps: Partial<IMeasureNumberFormatDropdownItemProps> = {
        isSelected: false,
    };

    public render(): React.ReactNode {
        const { preset, separators, isSelected } = this.props;
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

        return (
            <div className={className} onClick={this.handleOnClick}>
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
    }

    private handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const { preset, onClick } = this.props;
        onClick(preset);
        e.preventDefault();
    };
}
