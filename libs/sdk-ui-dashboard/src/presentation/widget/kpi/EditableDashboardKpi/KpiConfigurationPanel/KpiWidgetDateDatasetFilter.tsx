// (C) 2022 GoodData Corporation
import React from "react";
import { IKpiWidget } from "@gooddata/sdk-model";

import { DateDatasetFilter, useKpiWidgetRelatedDateDatasets } from "../../../common";

export const KpiWidgetDateDatasetFilter: React.FC<{
    widget: IKpiWidget;
}> = (props) => {
    const { widget } = props;
    const { status, result } = useKpiWidgetRelatedDateDatasets(props.widget);
    return (
        <div className="gd-kpi-date-dataset-dropdown">
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false} // for KPI date checkbox is always enabled
                isDropdownLoading={status === "loading" || status === "pending"}
                relatedDateDatasets={result}
            />
        </div>
    );
};
