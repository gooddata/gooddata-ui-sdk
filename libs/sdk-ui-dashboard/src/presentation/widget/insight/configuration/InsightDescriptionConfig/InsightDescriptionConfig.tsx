// (C) 2022 GoodData Corporation
import React, { useState, useMemo, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
    Typography,
    Dropdown,
    DropdownList,
    SingleSelectListItem,
    DropdownButton,
} from "@gooddata/sdk-ui-kit";
import { IInsightWidget, IInsightWidgetDescriptionConfiguration, IInsight } from "@gooddata/sdk-model";
import { InsightDescription } from "./InsightDescription";
import { useDashboardSelector, selectInsightByRef } from "../../../../../model";
import { IncludeMetrics } from "./IncludeMetrics";

interface IInsightDescriptionConfigProps {
    widget: IInsightWidget;
    descriptionConfig: IInsightWidgetDescriptionConfiguration;
    isWidgetDescriptionEnabled: boolean;
    setDescriptionConfiguration: (
        widget: IInsightWidget,
        newConfig: IInsightWidgetDescriptionConfiguration,
    ) => void;
    setWidgetDescription: (widget: IInsightWidget, newDescription: string) => void;
}

type DescriptionStateConfig = "none" | IInsightWidgetDescriptionConfiguration["source"];

interface IDescriptionConfigState {
    config: DescriptionStateConfig;
    description?: string;
    includeMetrics: boolean;
}

const getStateFromConfig = (
    descriptionConfig: IInsightWidgetDescriptionConfiguration,
    widget: IInsightWidget,
    insight?: IInsight,
): IDescriptionConfigState => {
    if (!descriptionConfig.visible) {
        return {
            config: "none",
            description: "",
            includeMetrics: false,
        };
    }
    const widgetSummaryEmpty = widget.description === undefined || widget.description === "";
    const useInsightDescription =
        descriptionConfig.source === "insight" ||
        (descriptionConfig.source === "widget" && widgetSummaryEmpty);
    return {
        config: descriptionConfig.source,
        description: useInsightDescription ? insight?.insight.summary : widget.description,
        includeMetrics: descriptionConfig.includeMetrics ?? false,
    };
};

export function InsightDescriptionConfig(props: IInsightDescriptionConfigProps) {
    const {
        descriptionConfig,
        widget,
        setDescriptionConfiguration,
        isWidgetDescriptionEnabled,
        setWidgetDescription,
    } = props;

    const intl = useIntl();

    const dropdownItems: Array<{
        id: DescriptionStateConfig;
        title: string;
        info?: string;
    }> = useMemo(
        () => [
            {
                id: "insight",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.inheritDescription" }),
                info: intl.formatMessage({ id: "configurationPanel.visualprops.inheritDescriptionHelp" }),
            },
            {
                id: "widget",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.customDescription" }),
                info: intl.formatMessage({ id: "configurationPanel.visualprops.customDescriptionHelp" }),
            },
            {
                id: "none",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.noneDescription" }),
            },
        ],
        [intl],
    );

    const insight = useDashboardSelector(selectInsightByRef(widget.insight));

    const [widgetDescriptionState, setWidgetDescriptionState] = useState(
        getStateFromConfig(descriptionConfig, widget, insight),
    );

    const handleDescriptionChange = useCallback(
        (newDescription: string) => {
            setWidgetDescription(widget, newDescription);
            setWidgetDescriptionState((prevState) => ({ ...prevState, description: newDescription }));
        },
        [widget, setWidgetDescription, setWidgetDescriptionState],
    );

    const handleDescriptionConfigChange = useCallback(
        (config: DescriptionStateConfig) => {
            let newConfig: IInsightWidgetDescriptionConfiguration;
            if (config === "none") {
                newConfig = {
                    includeMetrics: false,
                    visible: false,
                    source: "insight",
                };
            } else {
                newConfig = {
                    includeMetrics: widgetDescriptionState.includeMetrics,
                    visible: true,
                    source: config,
                };
            }

            setWidgetDescriptionState(getStateFromConfig(newConfig, widget, insight));
            setDescriptionConfiguration(widget, newConfig);
            if (config === "widget") {
                setWidgetDescription(widget, insight?.insight.summary ?? "");
            }
            if (config === "insight") {
                setWidgetDescription(widget, "");
            }
        },
        [
            widget,
            insight,
            setDescriptionConfiguration,
            setWidgetDescription,
            widgetDescriptionState.includeMetrics,
        ],
    );

    const handleIncludeMetricChange = useCallback(
        (includeMetrics: boolean) => {
            const newConfigState = {
                ...widgetDescriptionState,
                includeMetrics,
            };
            setWidgetDescriptionState(newConfigState);
            setDescriptionConfiguration(widget, {
                ...descriptionConfig,
                includeMetrics,
            });
        },
        [descriptionConfig, setDescriptionConfiguration, widget, widgetDescriptionState],
    );

    return (
        <>
            {isWidgetDescriptionEnabled ? (
                <div className="configuration-category s-description-configuration description-configuration-section">
                    <Typography tagName="h3">
                        <FormattedMessage id="configurationPanel.visualprops.sectionDescription" />
                    </Typography>
                    <Dropdown
                        renderBody={({ closeDropdown }) => (
                            <DropdownList
                                items={dropdownItems}
                                renderItem={({ item }) => {
                                    return (
                                        <SingleSelectListItem
                                            title={item.title}
                                            info={item.info}
                                            isSelected={item.id === widgetDescriptionState.config}
                                            onClick={() => {
                                                handleDescriptionConfigChange(item.id);
                                                closeDropdown();
                                            }}
                                        />
                                    );
                                }}
                            />
                        )}
                        renderButton={({ openDropdown, isOpen }) => (
                            <DropdownButton
                                value={
                                    dropdownItems.find((item) => item.id === widgetDescriptionState.config)
                                        ?.title
                                }
                                isOpen={isOpen}
                                onClick={openDropdown}
                                className="description-config-dropdown-button"
                            />
                        )}
                    />
                    {widgetDescriptionState.config === "widget" ? (
                        <InsightDescription
                            description={widgetDescriptionState.description ?? ""}
                            setDescription={handleDescriptionChange}
                        />
                    ) : null}
                    {
                        // TODO INE: enable this section as part of TNT-1134
                        // eslint-disable-next-line no-constant-condition, sonarjs/no-redundant-boolean
                        false && widgetDescriptionState.config !== "none" ? (
                            <IncludeMetrics
                                onChange={handleIncludeMetricChange}
                                value={widgetDescriptionState.includeMetrics}
                            />
                        ) : null
                    }
                </div>
            ) : null}
        </>
    );
}
