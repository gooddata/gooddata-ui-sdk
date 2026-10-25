// (C) 2019-2026 GoodData Corporation

import { Fragment, memo, useCallback } from "react";

import classNames from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { Header, Item, ItemsWrapper, Separator } from "@gooddata/sdk-ui-kit";

const chartTypeMessages = defineMessages({
    column: { id: "chart.column" },
    line: { id: "chart.line" },
    area: { id: "chart.area" },
});

import { type VisualizationType } from "../../typings/visualization.js";

import { ConfigurationCheckbox } from "./measure/ConfigurationCheckbox.js";
import { OptionalStacking } from "./OptionalStacking.js";

export interface IOperandDropdownBodyProps {
    isSecondaryAxisCheckboxVisible: boolean;
    isDualAxisEnabled: boolean;
    selectedChartType: string;
    /** the visualization's uiConfig chart types */
    supportedChartTypes: VisualizationType[];
    isOptionalStackingSupported: boolean;
    onSelect: (chartType: VisualizationType) => void;
    toggleDualAxis: (value: boolean) => void;
}

export const MeasureConfigurationBody = memo(function MeasureConfigurationBody({
    isSecondaryAxisCheckboxVisible,
    isDualAxisEnabled,
    selectedChartType,
    supportedChartTypes,
    isOptionalStackingSupported,
    onSelect,
    toggleDualAxis,
}: IOperandDropdownBodyProps) {
    const intl = useIntl();

    const getItemClasses = useCallback(
        (chartType: string) => {
            const isSelected = chartType === selectedChartType;

            return classNames("gd-list-item", `gd-vis-item-type-${chartType}`, {
                "s-is-selected": isSelected,
                "is-selected": isSelected,
            });
        },
        [selectedChartType],
    );

    const renderChartItem = useCallback(
        (chart: VisualizationType) => {
            const onClick = () => onSelect(chart);

            return (
                <Item className={getItemClasses(chart)} key={chart} onClick={onClick}>
                    <div className={`gd-list-item-icon gd-vis-type-${chart}`} />
                    <div>
                        {intl.formatMessage(
                            chartTypeMessages[chart as keyof typeof chartTypeMessages] ?? {
                                id: `chart.${chart}`,
                            },
                        )}
                    </div>
                </Item>
            );
        },
        [onSelect, intl, getItemClasses],
    );

    const renderChartList = useCallback(() => {
        return supportedChartTypes.map(renderChartItem);
    }, [supportedChartTypes, renderChartItem]);

    const renderStackingOnMeasureConfiguration = useCallback(() => {
        return (
            isOptionalStackingSupported && (
                <Fragment>
                    <Separator />
                    <div className="s-measure-configuration-footer">
                        <Header>{intl.formatMessage({ id: "dashboard.bucket_item.stacking" })}</Header>
                        <OptionalStacking />
                    </div>
                </Fragment>
            )
        );
    }, [intl, isOptionalStackingSupported]);

    const renderSecondaryAxisCheckbox = useCallback(() => {
        return (
            isSecondaryAxisCheckboxVisible && (
                <Fragment>
                    <Separator />
                    <div className="s-measure-configuration-footer">
                        <ConfigurationCheckbox
                            checked={isDualAxisEnabled}
                            onChange={toggleDualAxis}
                            label={intl.formatMessage({
                                id: "dashboard.bucket_item.show_on_right_axis",
                            })}
                            name="show-on-secondary-axis"
                        />
                    </div>
                </Fragment>
            )
        );
    }, [isSecondaryAxisCheckboxVisible, intl, isDualAxisEnabled, toggleDualAxis]);

    return (
        <ItemsWrapper className="s-measure-configuration-body">
            <Header>{intl.formatMessage({ id: "dashboard.bucket_item.display_as" })}</Header>
            {renderChartList()}
            {renderStackingOnMeasureConfiguration()}
            {renderSecondaryAxisCheckbox()}
        </ItemsWrapper>
    );
});
