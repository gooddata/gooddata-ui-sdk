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
import {
    areObjRefsEqual,
    ICatalogMeasure,
    IKpiWidgetDefinition,
    IKpiWidgetDescriptionConfiguration,
    ObjRef,
} from "@gooddata/sdk-model";
import { InsightDescription } from "../../insight/configuration/InsightDescriptionConfig/InsightDescription.js";

interface IKpiDescriptionConfigProps {
    kpi: IKpiWidgetDefinition;
    metrics: ICatalogMeasure[];
    descriptionConfig: IKpiWidgetDescriptionConfiguration;
    isKpiDescriptionEnabled: boolean;
    setDescriptionConfiguration: (
        kpi: IKpiWidgetDefinition,
        newConfig: IKpiWidgetDescriptionConfiguration,
    ) => void;
    setKpiDescription: (kpi: IKpiWidgetDefinition, newDescription: string) => void;
}

type DescriptionStateConfig = "none" | IKpiWidgetDescriptionConfiguration["source"];

interface IDescriptionConfigState {
    config: DescriptionStateConfig;
    description?: string;
}

const getKpiMetricDescription = (metrics: ICatalogMeasure[], ref: ObjRef): string | undefined => {
    return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, ref))?.measure.description;
};

const getStateFromConfig = (
    descriptionConfig: IKpiWidgetDescriptionConfiguration,
    kpiDescription: string,
    metricDescription: string,
): IDescriptionConfigState => {
    if (!descriptionConfig.visible) {
        return {
            config: "none",
            description: "",
        };
    }
    const useMetricDescription = descriptionConfig.source === "metric";
    return {
        config: descriptionConfig.source,
        description: useMetricDescription ? metricDescription : kpiDescription,
    };
};

export function KpiDescriptionConfig(props: IKpiDescriptionConfigProps) {
    const {
        descriptionConfig,
        kpi,
        metrics,
        setDescriptionConfiguration,
        isKpiDescriptionEnabled,
        setKpiDescription,
    } = props;

    const intl = useIntl();

    const dropdownItems: Array<{
        id: DescriptionStateConfig;
        title: string;
        info?: string;
    }> = useMemo(
        () => [
            {
                id: "metric",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.inheritDescription" }),
                info: intl.formatMessage({ id: "configurationPanel.visualprops.inheritKpiDescriptionHelp" }),
            },
            {
                id: "kpi",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.customDescription" }),
                info: intl.formatMessage({ id: "configurationPanel.visualprops.customKpiDescriptionHelp" }),
            },
            {
                id: "none",
                title: intl.formatMessage({ id: "configurationPanel.visualprops.noneDescription" }),
            },
        ],
        [intl],
    );

    const metricDescription = getKpiMetricDescription(metrics, kpi.kpi.metric) ?? "";

    const [kpiDescriptionState, setKpiDescriptionState] = useState(
        getStateFromConfig(descriptionConfig, kpi.description, metricDescription),
    );

    const [lastCustomKpiDescription, setLastCustomKpiDescription] = useState(kpi.description);

    const handleDescriptionChange = useCallback(
        (newDescription: string) => {
            setKpiDescription(kpi, newDescription);
            setKpiDescriptionState((prevState) => ({ ...prevState, description: newDescription }));
            setLastCustomKpiDescription(newDescription);
        },
        [kpi, setKpiDescription, setKpiDescriptionState],
    );

    const handleDescriptionConfigChange = useCallback(
        (config: DescriptionStateConfig) => {
            let newConfig: IKpiWidgetDescriptionConfiguration;
            if (config === "none") {
                newConfig = {
                    visible: false,
                    source: "metric",
                };
                setKpiDescriptionState(getStateFromConfig(newConfig, "", ""));
            } else {
                newConfig = {
                    visible: true,
                    source: config,
                };
                setKpiDescriptionState(
                    getStateFromConfig(
                        newConfig,
                        config === "kpi" ? lastCustomKpiDescription : "",
                        metricDescription,
                    ),
                );
            }

            setDescriptionConfiguration(kpi, newConfig);
            if (config === "kpi") {
                setKpiDescription(kpi, lastCustomKpiDescription ?? "");
            }
            if (config === "none" || config === "metric") {
                setKpiDescription(kpi, "");
            }
        },
        [kpi, metricDescription, setDescriptionConfiguration, setKpiDescription, lastCustomKpiDescription],
    );

    return (
        <>
            {isKpiDescriptionEnabled ? (
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
                                            isSelected={item.id === kpiDescriptionState.config}
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
                                    dropdownItems.find((item) => item.id === kpiDescriptionState.config)
                                        ?.title
                                }
                                isOpen={isOpen}
                                onClick={openDropdown}
                                className="description-config-dropdown-button s-description-config-dropdown-button"
                            />
                        )}
                    />
                    {kpiDescriptionState.config === "kpi" || kpiDescriptionState.config === "metric" ? (
                        <InsightDescription
                            description={kpiDescriptionState.description ?? ""}
                            setDescription={handleDescriptionChange}
                            readOnly={kpiDescriptionState.config === "metric"}
                        />
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
