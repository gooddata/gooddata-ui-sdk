// (C) 2020-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IErrorProps } from "@gooddata/sdk-ui";

interface IEmptyDashboardErrorProps {
    ErrorComponent: React.ComponentType<IErrorProps>;
}

const EmptyDashboardErrorCore: React.FC<IEmptyDashboardErrorProps & WrappedComponentProps> = ({
    ErrorComponent,
    intl,
}) => {
    return (
        <ErrorComponent
            className="s-layout-error"
            message={intl.formatMessage({ id: "dashboard.error.empty.heading" })}
            description={intl.formatMessage({ id: "dashboard.error.empty.text" })}
        />
    );
};

export const EmptyDashboardError = injectIntl(EmptyDashboardErrorCore);
