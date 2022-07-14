// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IKpiWidget, widgetRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict, useCancelablePromise } from "@gooddata/sdk-ui";
import { Typography } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop";

import { AttributeFilterConfiguration } from "../../common";
import { KpiComparison } from "./KpiComparison/KpiComparison";
import { KpiWidgetDateDatasetFilter } from "./KpiWidgetDateDatasetFilter";
import { KpiMetricDropdown } from "./KpiMetricDropdown/KpiMetricDropdown";
import { KpiConfigurationPanelHeader } from "./KpiConfigurationPanelHeader";
import { KpiConfigurationMessages } from "./KpiConfigurationMessages";

interface IKpiConfigurationPanelProps {
    widget: IKpiWidget;
}

export const KpiConfigurationPanel: React.FC<IKpiConfigurationPanelProps> = (props) => {
    const { widget } = props;
    const metric = widget.kpi.metric;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const { result: numberOfAlerts, status } = useCancelablePromise(
        {
            promise: widgetRef(widget)
                ? async () => {
                      const res = await backend
                          .workspace(workspace)
                          .dashboards()
                          .getWidgetAlertsCountForWidgets([widgetRef(widget)]);

                      return res[0]?.alertCount;
                  }
                : null,
        },
        [backend, workspace, widget],
    );

    const isNumOfAlertsLoaded = status === "success";

    const configurationCategoryClasses = cx("configuration-category", {
        "s-widget-alerts-information-loaded": isNumOfAlertsLoaded,
    });

    const filtersClasses = cx({ "is-disabled": !metric });

    return (
        <>
            <KpiConfigurationPanelHeader
                onCloseButtonClick={
                    noop // TODO
                }
            />
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
                    {/* {this.renderDrillInto()} */}
                </div>
            </div>
        </>
    );
};
