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
import { IInsightWidget, IInsightWidgetDescriptionConfiguration } from "@gooddata/sdk-model";
import { InsightDescription } from "./InsightDescription.js";
import { useDashboardSelector, selectInsightByRef } from "../../../../../model/index.js";
import { IncludeMetrics } from "./IncludeMetrics.js";

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
    widgetDescription: string | undefined,
    insightDescription: string | undefined,
): IDescriptionConfigState => {
    if (!descriptionConfig.visible) {
        return {
            config: "none",
            description: "",
            includeMetrics: false,
        };
    }

    const useInsightDescription = descriptionConfig.source === "insight";
    return {
        config: descriptionConfig.source,
        description: useInsightDescription ? insightDescription : widgetDescription,
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
        getStateFromConfig(descriptionConfig, widget.description, insight?.insight?.summary),
    );
    const [lastCustomWidgetDescription, setLastCustomWidgetDescription] = useState(widget.description);

    const handleDescriptionChange = useCallback(
        (newDescription: string) => {
            setWidgetDescription(widget, newDescription);
            setWidgetDescriptionState((prevState) => ({ ...prevState, description: newDescription }));
            setLastCustomWidgetDescription(newDescription);
        },
        [widget, setWidgetDescription, setWidgetDescriptionState],
    );

    const handleDescriptionConfigChange = useCallback(
        (config: DescriptionStateConfig) => {
            let newConfig: IInsightWidgetDescriptionConfiguration;
            const insightDescription = insight?.insight?.summary;

            if (config === "none") {
                newConfig = {
                    includeMetrics: false,
                    visible: false,
                    source: "insight",
                };
                setWidgetDescriptionState(getStateFromConfig(newConfig, "", ""));
            } else {
                newConfig = {
                    includeMetrics: widgetDescriptionState.includeMetrics,
                    visible: true,
                    source: config,
                };
                setWidgetDescriptionState(
                    getStateFromConfig(
                        newConfig,
                        config === "widget" ? lastCustomWidgetDescription : "",
                        insightDescription,
                    ),
                );
            }

            setDescriptionConfiguration(widget, newConfig);
            if (config === "widget") {
                setWidgetDescription(widget, lastCustomWidgetDescription ?? "");
            }
            if (config === "none" || config === "insight") {
                setWidgetDescription(widget, "");
            }
        },
        [
            widget,
            insight,
            setDescriptionConfiguration,
            setWidgetDescription,
            widgetDescriptionState.includeMetrics,
            lastCustomWidgetDescription,
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
                        closeOnParentScroll
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
                                className="description-config-dropdown-button s-description-config-dropdown-button"
                            />
                        )}
                    />
                    {widgetDescriptionState.config === "widget" ||
                    widgetDescriptionState.config === "insight" ? (
                        <InsightDescription
                            description={widgetDescriptionState.description ?? ""}
                            setDescription={handleDescriptionChange}
                            readOnly={widgetDescriptionState.config === "insight"}
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
