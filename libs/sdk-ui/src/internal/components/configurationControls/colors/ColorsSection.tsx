// (C) 2019 GoodData Corporation
import * as React from "react";
import set = require("lodash/set");
import get = require("lodash/get");
import cloneDeep = require("lodash/cloneDeep");
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IColor } from "@gooddata/sdk-model";
import Button from "@gooddata/goodstrap/lib/Button/Button";
import * as classNames from "classnames";

import ConfigSection from "../../configurationControls/ConfigSection";
import ColoredItemsList from "./coloredItemsList/ColoredItemsList";
import { getTranslation } from "../../../utils/translations";
import { IReferences, IVisualizationProperties } from "../../../interfaces/Visualization";
import { IColoredItem, IColorConfiguration } from "../../../interfaces/Colors";
import { getColoredInputItems, getProperties } from "../../../utils/colors";

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

class ColorsSection extends React.Component<IColorsSectionProps & WrappedComponentProps> {
    public render() {
        const { pushData, propertiesMeta } = this.props;

        return (
            <ConfigSection
                title="properties.colors"
                pushData={pushData}
                propertiesMeta={propertiesMeta}
                id="colors_section"
                className="adi-color-configuration"
            >
                {this.renderSectionContents()}
            </ConfigSection>
        );
    }

    private onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        const { properties, pushData } = this.props;
        const { mappingHeader } = selectedColorItem;
        const result = getProperties(properties, mappingHeader, color);

        const message = {
            messageId: COLOR_MAPPING_CHANGED,
            properties: result,
        };

        pushData(message);
    };

    private isColoredListVisible() {
        const { colors, hasMeasures, controlsDisabled, isLoading } = this.props;

        return isLoading || (!controlsDisabled && (colors && colors.colorPalette && hasMeasures));
    }

    private renderResetButton() {
        const { controlsDisabled } = this.props;
        const isDisabled = controlsDisabled || this.isDefaultColorMapping();

        const classes = classNames("gd-color-reset-colors-section", {
            disabled: isDisabled,
        });

        return (
            <div className={classes}>
                <Button
                    value={getTranslation("properties.colors.reset-colors", this.props.intl)}
                    className="gd-button-link s-reset-colors-button"
                    onClick={this.onResetColors}
                    disabled={isDisabled}
                />
            </div>
        );
    }

    private renderColoredList() {
        const { colors, showCustomPicker, controlsDisabled, isLoading } = this.props;

        const inputItems = getColoredInputItems(colors);
        const colorPalette = colors && colors.colorPalette ? colors.colorPalette : [];

        return (
            <div>
                <ColoredItemsList
                    colorPalette={colorPalette}
                    inputItems={inputItems}
                    onSelect={this.onSelect}
                    showCustomPicker={showCustomPicker}
                    disabled={controlsDisabled}
                    isLoading={isLoading}
                />
                {this.renderResetButton()}
            </div>
        );
    }

    private isDefaultColorMapping() {
        const { properties } = this.props;
        const colorMapping = get(properties, "controls.colorMapping", []);
        return !colorMapping || colorMapping.length === 0;
    }

    private onResetColors = () => {
        const { properties, pushData } = this.props;
        if (this.isDefaultColorMapping()) {
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

    private renderUnsupportedColoredList() {
        return (
            <div className="gd-color-unsupported">
                {getTranslation("properties.colors.unsupported", this.props.intl)}
            </div>
        );
    }

    private renderSectionContents() {
        return this.isColoredListVisible() ? this.renderColoredList() : this.renderUnsupportedColoredList();
    }
}

export default injectIntl(ColorsSection);
