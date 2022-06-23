// (C) 2020-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IErrorProps } from "@gooddata/sdk-ui";

interface IEmptyDashboardErrorProps {
    ErrorComponent: React.ComponentType<IErrorProps>;
}

export const EmptyDashboardError: React.FC<IEmptyDashboardErrorProps> = ({ ErrorComponent }) => {
    const intl = useIntl();
    return (
        <ErrorComponent
            className="s-layout-error"
            message={intl.formatMessage({ id: "dashboard.error.empty.heading" })}
            description={intl.formatMessage({ id: "dashboard.error.empty.text" })}
        />
    );
};
