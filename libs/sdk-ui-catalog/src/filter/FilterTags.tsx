// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

const dataTestId = `${testIds.filter}/tags`;

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    onChange: (selection: string[]) => void;
};

export function FilterTags({ backend, workspace, onChange }: Props) {
    const { result: options, status } = useCancelablePromise<string[], Error>(
        {
            async promise() {
                // TODO: Implement this once API is ready
                return [];
            },
            onError(error) {
                console.error(error);
            },
        },
        [backend, workspace],
    );

    if (status === "loading" || status === "pending") {
        return <UiSkeleton itemsCount={1} itemWidth={55} itemHeight={27} itemBorderRadius={4} />;
    }

    if (status === "error") {
        return null;
    }

    return (
        <StaticFilter
            options={options}
            onChange={onChange}
            dataTestId={dataTestId}
            header={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}
            noDataMessage={<FormattedMessage id="analyticsCatalog.filter.tags.noOptions" />}
        />
    );
}

export const FilterTagsMemo = memo(FilterTags);
