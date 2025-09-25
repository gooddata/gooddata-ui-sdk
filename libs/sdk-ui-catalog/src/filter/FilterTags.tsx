// (C) 2025 GoodData Corporation

import { memo, useMemo } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

const dataTestId = `${testIds.filter}/tags`;

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function FilterTags({ backend, workspace }: Props) {
    const { tags } = useFilterState();
    const { setTags } = useFilterActions();
    const { result, status } = useCancelablePromise<{ tags: string[] }, Error>(
        {
            async promise() {
                return backend.workspace(workspace).genAI().getAnalyticsCatalog().getTags();
            },
            onError(error) {
                console.error(error);
            },
        },
        [backend, workspace],
    );

    const options = useMemo(() => result?.tags.sort() ?? [], [result?.tags]);

    if (status === "loading" || status === "pending") {
        return <UiSkeleton itemsCount={1} itemWidth={92} itemHeight={27} itemBorderRadius={4} />;
    }

    if (status === "error") {
        return null;
    }

    return (
        <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}>
            <StaticFilter
                key={tags.length} // Resets the filter state on explicit tags change
                initialValue={tags}
                options={options}
                onChange={setTags}
                dataTestId={dataTestId}
                header={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}
                noDataMessage={<FormattedMessage id="analyticsCatalog.filter.tags.noOptions" />}
            />
        </FilterGroupLayout>
    );
}

export const FilterTagsMemo = memo(FilterTags);
