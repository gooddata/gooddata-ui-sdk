// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";

export const EmptyDashboardError: React.FC = () => {
    const intl = useIntl();
    const { ErrorComponent } = useDashboardComponentsContext();
    return (
        <ErrorComponent
            className="s-layout-error"
            message={intl.formatMessage({ id: "dashboard.error.empty.heading" })}
            description={intl.formatMessage({ id: "dashboard.error.empty.text" })}
        />
    );
};
