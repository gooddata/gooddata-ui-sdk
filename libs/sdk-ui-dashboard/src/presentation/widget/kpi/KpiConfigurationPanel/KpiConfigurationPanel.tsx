// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IKpiWidget } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop";

import { AttributeFilterConfiguration } from "../../common";
import { KpiComparison } from "./KpiComparison";
import { KpiWidgetDateDatasetFilter } from "./KpiWidgetDateDatasetFilter";
import { KpiMetricDropdown } from "./KpiMetricDropdown";
import { KpiConfigurationPanelHeader } from "./KpiConfigurationPanelHeader";

interface IKpiConfigurationPanelProps {
    widget: IKpiWidget;
}

export const KpiConfigurationPanel: React.FC<IKpiConfigurationPanelProps> = (props) => {
    const { widget } = props;
    const metric = widget.kpi.metric;
    const configurationCategoryClasses = cx("configuration-category", {
        "s-widget-alerts-information-loaded": false, // isNumOfAlertsLoaded, // TODO
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
                    {/* {this.renderMessages()} */}

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
