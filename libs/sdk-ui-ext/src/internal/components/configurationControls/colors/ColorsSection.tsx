// (C) 2019-2025 GoodData Corporation

import cx from "classnames";
import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IColor } from "@gooddata/sdk-model";
import { type ChartFillType } from "@gooddata/sdk-ui-charts";
import { Button } from "@gooddata/sdk-ui-kit";

import { ColoredItemsList } from "./coloredItemsList/ColoredItemsList.js";
import { messages } from "../../../../locales.js";
import { fillDropdownItems } from "../../../constants/dropdowns.js";
import { type IColorConfiguration, type IColoredItem } from "../../../interfaces/Colors.js";
import { type IReferences, type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getColoredInputItems, getProperties } from "../../../utils/colors.js";
import { getTranslatedDropdownItems, getTranslation } from "../../../utils/translations.js";
import { ConfigSection } from "../../configurationControls/ConfigSection.js";
import { DropdownControl } from "../DropdownControl.js";

export interface IColorsSectionProps {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    references: IReferences;
    pushData: (data: any) => void;
    hasMeasures: boolean;
    colors: IColorConfiguration;
    isLoading: boolean;
    supportsChartFill: boolean;
    chartFillIgnoredMeasures?: string[];
    isChartFillDisabled?: boolean;
}

export const COLOR_MAPPING_CHANGED = "COLOR_MAPPING_CHANGED";

export function ColorsSection({
    controlsDisabled,
    properties,
    propertiesMeta,
    pushData,
    hasMeasures,
    colors,
    isLoading,
    supportsChartFill,
    chartFillIgnoredMeasures = [],
    isChartFillDisabled,
}: IColorsSectionProps) {
    const intl = useIntl();
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
        const colorMapping = properties?.controls?.["colorMapping"] ?? [];
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
                    value={getTranslation(messages["resetColors"].id, intl)}
                    className="gd-button-link s-reset-colors-button"
                    onClick={onResetColors}
                    disabled={isDisabled}
                />
            </div>
        );
    };

    const renderFillDropdown = () => {
        if (!supportsChartFill) {
            return null;
        }
        const isDisabled =
            controlsDisabled ||
            isChartFillDisabled ||
            // when all colors are used for disabled measures, chart fill is not available
            chartFillIgnoredMeasures.length === colors?.colorAssignments.length;
        const currentChartFillValue: ChartFillType = isChartFillDisabled
            ? "solid"
            : (properties?.controls?.["chartFill"]?.type ?? "solid");
        return (
            <div className="gd-chart-fill-section">
                <DropdownControl
                    value={currentChartFillValue}
                    valuePath="chartFill.type"
                    labelText={messages["fill"].id}
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(fillDropdownItems, intl)}
                    showDisabledMessage={isDisabled}
                />
            </div>
        );
    };

    const renderColoredList = () => {
        const inputItems = getColoredInputItems(colors);
        const colorPalette = colors?.colorPalette ? colors.colorPalette : [];
        const chartFill = isChartFillDisabled ? undefined : properties?.controls?.["chartFill"];

        return (
            <>
                <ColoredItemsList
                    colorPalette={colorPalette}
                    inputItems={inputItems}
                    onSelect={onSelect}
                    disabled={controlsDisabled}
                    isLoading={isLoading}
                    chartFill={chartFill}
                    chartFillIgnoredMeasures={chartFillIgnoredMeasures}
                />
                {renderResetButton()}
                {renderFillDropdown()}
            </>
        );
    };

    const renderUnsupportedColoredList = () => {
        return (
            <div className="gd-color-unsupported">
                {getTranslation(messages["unsupportedColors"].id, intl)}
            </div>
        );
    };

    const renderSectionContents = () => {
        return isColoredListVisible() ? renderColoredList() : renderUnsupportedColoredList();
    };

    const sectionTitleTranslationId = supportsChartFill
        ? messages["colorsAndFills"].id
        : messages["colors"].id;

    return (
        <ConfigSection
            title={sectionTitleTranslationId}
            pushData={pushData}
            propertiesMeta={propertiesMeta}
            id="colors_section"
            className="adi-color-configuration"
        >
            {renderSectionContents()}
        </ConfigSection>
    );
}
