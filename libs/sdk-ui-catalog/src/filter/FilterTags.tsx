// (C) 2025-2026 GoodData Corporation

import { memo, useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { filterTags } from "../automation/testIds.js";
import { useCatalogTags } from "../catalogResource/CatalogTagsContext.js";

export function FilterTags() {
    const intl = useIntl();
    const { tags } = useFilterState();
    const { setTags } = useFilterActions();
    const { tags: options, status } = useCatalogTags();

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
            dataTestId={filterTags}
            noDataMessage={<FormattedMessage id="analyticsCatalog.filter.tags.noOptions" />}
        />
    );
}

export const FilterTagsMemo = memo(FilterTags);
