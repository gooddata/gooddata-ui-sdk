// (C) 2025 GoodData Corporation

import type { PropsWithChildren } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent, LoadingComponent, type UseCancelablePromiseStatus } from "@gooddata/sdk-ui";

type Props = PropsWithChildren<{
    status: UseCancelablePromiseStatus;
    error?: Error;
}>;

export function CatalogDetailStatus({ status, error, children }: Props) {
    const intl = useIntl();

    if (status === "loading" || status === "pending") {
        return (
            <div className="gd-analytics-catalog-detail__loading">
                <LoadingComponent />
            </div>
        );
    }
    if (status === "error") {
        return (
            <div className="gd-analytics-catalog-detail__error">
                <ErrorComponent
                    message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                    description={error?.message}
                />
            </div>
        );
    }

    return <>{children}</>;
}
