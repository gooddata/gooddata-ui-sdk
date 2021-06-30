// (C) 2020 GoodData Corporation
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
            message={intl.formatMessage({ id: "dashboard.embedded.error.empty.heading" })}
            description={intl.formatMessage({ id: "dashboard.embedded.error.empty.text" })}
        />
    );
};

export const EmptyDashboardError = injectIntl(EmptyDashboardErrorCore);
