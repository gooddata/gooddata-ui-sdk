// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { IColor } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import ColoredItemsList from "./coloredItemsList/ColoredItemsList.js";
import { messages } from "../../../../locales.js";
import { IColorConfiguration, IColoredItem } from "../../../interfaces/Colors.js";
import { IReferences, IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getColoredInputItems, getProperties } from "../../../utils/colors.js";
import { getTranslation } from "../../../utils/translations.js";
import ConfigSection from "../../configurationControls/ConfigSection.js";

export interface IColorsSectionProps {
    controlsDisabled: boolean;
    showCustomPicker: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    references: IReferences;
    pushData: (data: any) => void;
    hasMeasures: boolean;
    colors: IColorConfiguration;
    isLoading: boolean;
}

export const COLOR_MAPPING_CHANGED = "COLOR_MAPPING_CHANGED";

function ColorsSection({
    controlsDisabled,
    showCustomPicker,
    properties,
    propertiesMeta,
    pushData,
    hasMeasures,
    colors,
    isLoading,
    intl,
}: IColorsSectionProps & WrappedComponentProps) {
    const onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        const { mappingHeader } = selectedColorItem;
        const result = getProperties(properties, mappingHeader, color);

        const message = {
            messageId: COLOR_MAPPING_CHANGED,
            properties: result,
        };

        pushData(message);
    };

    const isColoredListVisible = () => {
        return isLoading || (!controlsDisabled && colors?.colorPalette && hasMeasures);
    };

    const isDefaultColorMapping = () => {
        const colorMapping = properties?.controls?.colorMapping ?? [];
        return !colorMapping || colorMapping.length === 0;
    };

    const onResetColors = () => {
        if (isDefaultColorMapping()) {
            return;
        }
        const propertiesWithoutColorMapping = set(cloneDeep(properties), "controls.colorMapping", undefined);
        const message: any = {
            messageId: COLOR_MAPPING_CHANGED,
            properties: propertiesWithoutColorMapping,
            references: {},
        };
        pushData(message);
    };

    const renderResetButton = () => {
        const isDisabled = controlsDisabled || isDefaultColorMapping();

        const classes = cx("gd-color-reset-colors-section", {
            disabled: isDisabled,
        });

        return (
            <div className={classes}>
                <Button
                    value={getTranslation(messages.resetColors.id, intl)}
                    className="gd-button-link s-reset-colors-button"
                    onClick={onResetColors}
                    disabled={isDisabled}
                />
            </div>
        );
    };

    const renderColoredList = () => {
        const inputItems = getColoredInputItems(colors);
        const colorPalette = colors?.colorPalette ? colors.colorPalette : [];

        return (
            <div>
                <ColoredItemsList
                    colorPalette={colorPalette}
                    inputItems={inputItems}
                    onSelect={onSelect}
                    showCustomPicker={showCustomPicker}
                    disabled={controlsDisabled}
                    isLoading={isLoading}
                />
                {renderResetButton()}
            </div>
        );
    };

    const renderUnsupportedColoredList = () => {
        return (
            <div className="gd-color-unsupported">{getTranslation(messages.unsupportedColors.id, intl)}</div>
        );
    };

    const renderSectionContents = () => {
        return isColoredListVisible() ? renderColoredList() : renderUnsupportedColoredList();
    };

    return (
        <ConfigSection
            title={messages.colors.id}
            pushData={pushData}
            propertiesMeta={propertiesMeta}
            id="colors_section"
            className="adi-color-configuration"
        >
            {renderSectionContents()}
        </ConfigSection>
    );
}

export default injectIntl(ColorsSection);
