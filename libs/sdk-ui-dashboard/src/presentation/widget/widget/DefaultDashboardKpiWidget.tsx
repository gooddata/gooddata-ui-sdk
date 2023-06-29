// (C) 2022 GoodData Corporation
import { FilterContextItem, IKpiWidget, ScreenSize, widgetRef } from "@gooddata/sdk-model";
import cx from "classnames";
import { OnError } from "@gooddata/sdk-ui";
import React from "react";
import { DashboardItem } from "../../presentationComponents/index.js";
import { DashboardKpi } from "../kpi/index.js";
import { selectAlertByWidgetRef, useDashboardSelector, useWidgetSelection } from "../../../model/index.js";
import { IDashboardFilter } from "../../../types.js";

interface IDefaultDashboardKpiWidgetProps {
    kpiWidget: IKpiWidget;
    screen: ScreenSize;
    dashboardItemClasses: string;

    onError?: OnError;
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;
}

export const DefaultDashboardKpiWidget: React.FC<IDefaultDashboardKpiWidgetProps> = (props) => {
    const { kpiWidget, onError, onFiltersChange, screen, dashboardItemClasses } = props;

    const { isSelected } = useWidgetSelection(widgetRef(kpiWidget));
    const alertSelector = selectAlertByWidgetRef(widgetRef(kpiWidget));
    const alert = useDashboardSelector(alertSelector);

    return (
        <DashboardItem
            className={cx("type-kpi", dashboardItemClasses, { "is-selected": isSelected })}
            screen={screen}
        >
            <DashboardKpi
                kpiWidget={kpiWidget}
                alert={alert}
                onFiltersChange={onFiltersChange}
                onError={onError}
            />
        </DashboardItem>
    );
};
