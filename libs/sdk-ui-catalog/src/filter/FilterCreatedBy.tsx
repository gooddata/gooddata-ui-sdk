// (C) 2025 GoodData Corporation

import { memo, useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import type { IAnalyticalBackend, IAnalyticsCatalogCreatedBy } from "@gooddata/sdk-backend-spi";
import type { IUser } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { UiButton, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

const dataTestId = `${testIds.filter}/created-by`;

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function FilterGroupBy({ backend, workspace }: Props) {
    const intl = useIntl();
    const { setCreatedBy } = useFilterActions();

    const [queryKey, setQueryKey] = useState(0);
    const refetch = () => setQueryKey((queryKey) => queryKey + 1);

    const { result, status } = useCancelablePromise<IAnalyticsCatalogCreatedBy, Error>(
        {
            async promise() {
                return backend.workspace(workspace).genAI().getAnalyticsCatalog().getCreatedBy();
            },
            onError(error) {
                console.error(error);
            },
        },
        [backend, workspace, queryKey],
    );

    const options = useMemo(() => sortUsers(result?.users), [result?.users]);

    if (status === "loading" || status === "pending") {
        return <UiSkeleton itemsCount={1} itemWidth={131} itemHeight={27} itemBorderRadius={4} />;
    }

    if (status === "error") {
        return null;
    }

    const { users, reasoning } = result;
    const isSyncing = reasoning !== "" && users.length === 0; // Metadata sync in progress

    return (
        <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.createdBy.title" />}>
            <StaticFilter
                options={options}
                onChange={(selection) => setCreatedBy(selection.map(getItemKey))}
                getItemKey={getItemKey}
                getItemTitle={getItemTitle}
                dataTestId={dataTestId}
                header={<FormattedMessage id="analyticsCatalog.filter.createdBy.title" />}
                noDataMessage={
                    isSyncing ? (
                        reasoning
                    ) : (
                        <FormattedMessage id="analyticsCatalog.filter.createdBy.noOptions" />
                    )
                }
                statusBar={isSyncing ? <></> : undefined}
                actions={
                    isSyncing ? (
                        <UiButton
                            onClick={refetch}
                            label={intl.formatMessage({ id: "analyticsCatalog.filter.refresh" })}
                            size="small"
                            variant="primary"
                        />
                    ) : undefined
                }
            />
        </FilterGroupLayout>
    );
}

export const FilterGroupByMemo = memo(FilterGroupBy);

function getItemKey(item: IUser): string {
    return item.login;
}

function getItemTitle(item: IUser): string {
    return item.fullName ?? item.login;
}

function sortUsers(users: IUser[] = []): IUser[] {
    // Sort alphabetically
    return [...users].sort((a, b) => {
        return getItemTitle(a).toLowerCase().localeCompare(getItemTitle(b).toLowerCase());
    });
}
