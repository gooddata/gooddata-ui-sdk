// (C) 2025 GoodData Corporation

import { memo, useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function FilterTags({ backend, workspace }: Props) {
    const intl = useIntl();
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

    const options = useMemo(() => sortTags(result?.tags), [result?.tags]);

    const selection = useMemo(
        () => options.filter((item) => tags.values.includes(item)),
        [options, tags.values],
    );

    if (status === "loading" || status === "pending") {
        return <UiSkeleton itemsCount={1} itemWidth={64} itemHeight={27} itemBorderRadius={4} />;
    }

    if (status === "error") {
        return null;
    }

    return (
        <StaticFilter
            label={intl.formatMessage({ id: "analyticsCatalog.filter.tags.title" })}
            options={options}
            selection={selection}
            isSelectionInverted={tags.isInverted}
            onSelectionChange={(selection, isInverted) => setTags({ values: selection, isInverted })}
            dataTestId={testIds.filterTags}
            noDataMessage={<FormattedMessage id="analyticsCatalog.filter.tags.noOptions" />}
        />
    );
}

export const FilterTagsMemo = memo(FilterTags);

function sortTags(tags: string[] = []): string[] {
    // Sort alphabetically
    return [...tags].sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
}
