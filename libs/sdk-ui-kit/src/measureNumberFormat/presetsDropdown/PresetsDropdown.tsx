// (C) 2020-2025 GoodData Corporation
import { memo } from "react";
import { WrappedComponentProps } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import { IFormatPreset } from "../typings.js";
import { PresetsDropdownItem } from "./PresetsDropdownItem.js";
import { IPositioning, SnapPoint } from "../../typings/positioning.js";
import { positioningToAlignPoints } from "../../utils/positioning.js";
import { Overlay } from "../../Overlay/index.js";

interface IMeasureNumberFormatDropdownOwnProps {
    presets: ReadonlyArray<IFormatPreset>;
    customPreset: IFormatPreset;
    selectedPreset: IFormatPreset;
    separators: ISeparators;
    onSelect: (selectedPreset: IFormatPreset) => void;
    onClose: () => void;
    anchorEl?: string | HTMLElement;
    positioning?: IPositioning[];
}

type IMeasureNumberFormatDropdownProps = IMeasureNumberFormatDropdownOwnProps & WrappedComponentProps;

export const PresetsDropdown = memo(function PresetsDropdown(props: IMeasureNumberFormatDropdownProps) {
    const {
        presets,
        anchorEl,
        onClose,
        positioning = defaultPositioning,
        selectedPreset,
        separators,
        onSelect,
        customPreset,
    } = props;

    const renderPresetOption = (preset: IFormatPreset, index?: number) => {
        const isPresetItemSelected =
            selectedPreset && preset.localIdentifier === selectedPreset.localIdentifier;

        return (
            <PresetsDropdownItem
                key={`${preset.localIdentifier}_${index}`} // eliminate possible collision with hardcoded options
                preset={preset}
                separators={separators}
                onClick={onSelect}
                isSelected={isPresetItemSelected}
            />
        );
    };

    const renderCustomFormatItem = () => {
        return renderPresetOption(customPreset, presets.length);
    };

    return (
        <Overlay
            closeOnOutsideClick={true}
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            alignTo={anchorEl}
            alignPoints={positioningToAlignPoints(positioning!)} // positioning is declared in defaultProps so it is always defined
            onClose={onClose}
        >
            <div className="gd-dropdown overlay">
                <div className="gd-measure-number-format-dropdown-body s-measure-number-format-dropdown-body">
                    {presets.map((preset, index) => renderPresetOption(preset, index))}
                    {renderCustomFormatItem()}
                </div>
            </div>
        </Overlay>
    );
});

const defaultPositioning: IPositioning[] = [
    { snapPoints: { parent: SnapPoint.BottomLeft, child: SnapPoint.TopLeft } },
    { snapPoints: { parent: SnapPoint.TopLeft, child: SnapPoint.BottomLeft } },
];
