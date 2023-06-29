// (C) 2022-2023 GoodData Corporation
import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IKpiWidget, IKpiWidgetDescriptionConfiguration, ObjRef, widgetRef } from "@gooddata/sdk-model";
import { ScrollablePanel, Typography } from "@gooddata/sdk-ui-kit";

import { AttributeFilterConfiguration } from "../../common/index.js";
import { KpiComparison } from "./KpiComparison/KpiComparison.js";
import { KpiWidgetDateDatasetFilter } from "./KpiWidgetDateDatasetFilter.js";
import { KpiMetricDropdown } from "./KpiMetricDropdown/KpiMetricDropdown.js";
import { KpiConfigurationPanelHeader } from "./KpiConfigurationPanelHeader.js";
import { KpiConfigurationMessages } from "./KpiConfigurationMessages.js";
import { KpiDrillConfiguration } from "./KpiDrill/KpiDrillConfiguration.js";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";
import {
    changeKpiWidgetConfiguration,
    changeKpiWidgetDescription,
    QueryWidgetAlertCount,
    queryWidgetAlertCount,
    selectCatalogMeasures,
    selectHideKpiDrillInEmbedded,
    selectIsEmbedded,
    selectSettings,
    useDashboardDispatch,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model/index.js";
import { KpiDescriptionConfig } from "./KpiDescriptionConfig.js";

interface IKpiConfigurationPanelCoreProps {
    widget?: IKpiWidget;
    onMeasureChange: (item: ObjRef) => void;
    onClose: () => void;
}

export const KpiConfigurationPanelCore: React.FC<IKpiConfigurationPanelCoreProps> = (props) => {
    const { widget, onMeasureChange, onClose } = props;

    const ref = widget && widgetRef(widget);
    const metric = widget?.kpi.metric;

    const {
        run: runAlertNumberQuery,
        result: numberOfAlerts,
        status,
    } = useDashboardQueryProcessing<QueryWidgetAlertCount, number, Parameters<typeof queryWidgetAlertCount>>({
        queryCreator: queryWidgetAlertCount,
    });

    useEffect(() => {
        if (ref) {
            runAlertNumberQuery(ref);
        }
    }, [safeSerializeObjRef(ref)]);

    const isNumOfAlertsLoaded = status === "success";

    const configurationCategoryClasses = cx("configuration-category", {
        "s-widget-alerts-information-loaded": isNumOfAlertsLoaded,
    });
    const scrollablePanelClasses = cx(
        "configuration-panel",
        "configuration-panel-kpi",
        "s-configuration-scrollable-panel",
    );

    const sectionHeaderClasses = cx({ "is-disabled": !metric });

    const defaultDescriptionConfig: IKpiWidgetDescriptionConfiguration = {
        source: "metric",
        visible: true,
    };

    const settings = useDashboardSelector(selectSettings);
    const measures = useDashboardSelector(selectCatalogMeasures);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const hideKpiDrillInEmbedded = useDashboardSelector(selectHideKpiDrillInEmbedded);
    const dispatch = useDashboardDispatch();

    return (
        <>
            <KpiConfigurationPanelHeader onCloseButtonClick={onClose} />
            <ScrollablePanel className={scrollablePanelClasses}>
                <div className={configurationCategoryClasses}>
                    <KpiConfigurationMessages numberOfAlerts={numberOfAlerts} />

                    <Typography tagName="h3">
                        <FormattedMessage id="configurationPanel.measure" />
                    </Typography>
                    <KpiMetricDropdown widget={widget} onMeasureChange={onMeasureChange} />
                    {!!widget && (
                        <KpiDescriptionConfig
                            kpi={widget}
                            metrics={measures}
                            isKpiDescriptionEnabled={settings.enableDescriptions || false}
                            descriptionConfig={widget.configuration?.description || defaultDescriptionConfig}
                            setDescriptionConfiguration={(kpi, config) => {
                                dispatch(
                                    changeKpiWidgetConfiguration(kpi.ref!, {
                                        ...kpi.configuration,
                                        description: config,
                                    }),
                                );
                            }}
                            setKpiDescription={(kpi, description) => {
                                dispatch(
                                    changeKpiWidgetDescription(kpi.ref!, {
                                        description,
                                    }),
                                );
                            }}
                        />
                    )}
                    <Typography tagName="h3" className={sectionHeaderClasses}>
                        <FormattedMessage id="configurationPanel.filterBy" />
                    </Typography>
                    {!!widget && (
                        <>
                            <KpiWidgetDateDatasetFilter widget={widget} />
                            <AttributeFilterConfiguration widget={widget} />
                        </>
                    )}

                    <Typography tagName="h3" className={sectionHeaderClasses}>
                        <FormattedMessage id="configurationPanel.comparison" />
                    </Typography>
                    {!!widget && <KpiComparison widget={widget} />}

                    {isEmbedded && hideKpiDrillInEmbedded ? null : (
                        <>
                            <Typography tagName="h3" className={sectionHeaderClasses}>
                                <FormattedMessage id="configurationPanel.drillIntoDashboard" />
                            </Typography>
                            {!!widget && <KpiDrillConfiguration widget={widget} />}
                        </>
                    )}
                </div>
            </ScrollablePanel>
        </>
    );
};
