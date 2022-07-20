// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IKpiWidget, serializeObjRef, widgetRef } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { Typography } from "@gooddata/sdk-ui-kit";

import { AttributeFilterConfiguration } from "../../../common";
import { KpiComparison } from "./KpiComparison/KpiComparison";
import { KpiWidgetDateDatasetFilter } from "./KpiWidgetDateDatasetFilter";
import { KpiMetricDropdown } from "./KpiMetricDropdown/KpiMetricDropdown";
import { KpiConfigurationPanelHeader } from "./KpiConfigurationPanelHeader";
import { KpiConfigurationMessages } from "./KpiConfigurationMessages";
import { KpiDrillConfiguration } from "./KpiDrill/KpiDrillConfiguration";
import { uiActions, useDashboardDispatch } from "../../../../../model";

interface IKpiConfigurationPanelProps {
    widget: IKpiWidget;
}

export const KpiConfigurationPanel: React.FC<IKpiConfigurationPanelProps> = (props) => {
    const { widget } = props;

    const ref = widgetRef(widget);
    const metric = widget.kpi.metric;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const dispatch = useDashboardDispatch();

    const closeConfigPanel = useCallback(
        () => dispatch(uiActions.setConfigurationPanelOpened(false)),
        [dispatch],
    );

    const { result: numberOfAlerts, status } = useCancelablePromise(
        {
            promise: ref
                ? async () => {
                      const res = await backend
                          .workspace(workspace)
                          .dashboards()
                          .getWidgetAlertsCountForWidgets([ref]);

                      return res[0]?.alertCount;
                  }
                : null,
        },
        [backend, workspace, serializeObjRef(ref)],
    );

    const isNumOfAlertsLoaded = status === "success";

    const configurationCategoryClasses = cx("configuration-category", {
        "s-widget-alerts-information-loaded": isNumOfAlertsLoaded,
    });

    const filtersClasses = cx({ "is-disabled": !metric });

    return (
        <>
            <KpiConfigurationPanelHeader onCloseButtonClick={closeConfigPanel} />
            <div className="configuration-panel">
                <div className={configurationCategoryClasses}>
                    <KpiConfigurationMessages numberOfAlerts={numberOfAlerts} />

                    <Typography tagName="h3">
                        <FormattedMessage id="configurationPanel.measure" />
                    </Typography>
                    <KpiMetricDropdown widget={widget} />

                    <Typography tagName="h3" className={filtersClasses}>
                        <FormattedMessage id="configurationPanel.filterBy" />
                    </Typography>
                    <KpiWidgetDateDatasetFilter widget={widget} />
                    <AttributeFilterConfiguration widget={widget} />
                    <KpiComparison widget={widget} />
                    <KpiDrillConfiguration widget={widget} />
                </div>
            </div>
        </>
    );
};
