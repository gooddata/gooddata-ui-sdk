// (C) 2025 GoodData Corporation

import { type PropsWithChildren, memo, useCallback, useMemo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

type OriginOption = Exclude<ObjectOrigin, "ALL">;

const options: OriginOption[] = ["PARENTS", "NATIVE"];

const messages: Record<OriginOption, MessageDescriptor> = defineMessages({
    PARENTS: { id: "analyticsCatalog.filter.origin.parents" },
    NATIVE: { id: "analyticsCatalog.filter.origin.native" },
});

export function FilterOrigin() {
    const intl = useIntl();
    const { origin } = useFilterState();
    const { setOrigin } = useFilterActions();

    const selection: OriginOption[] = useMemo(() => (origin === "ALL" ? [] : [origin]), [origin]);
    const isSelectionInverted = origin === "ALL";

    const getItemTitle = useCallback((item: OriginOption) => intl.formatMessage(messages[item]), [intl]);

    const handleChange = (selection: OriginOption[], isInverted: boolean) => {
        const included = isInverted ? options.filter((option) => !selection.includes(option)) : selection;
        if (included.length === 0 || included.length === options.length) {
            setOrigin("ALL");
            return;
        }
        if (included.includes("PARENTS")) {
            setOrigin("PARENTS");
        } else {
            setOrigin("NATIVE");
        }
    };

    return (
        <StaticFilter
            label={intl.formatMessage({ id: "analyticsCatalog.filter.origin.title" })}
            options={options}
            selection={selection}
            isSelectionInverted={isSelectionInverted}
            onSelectionChange={handleChange}
            getItemTitle={getItemTitle}
            dataTestId={testIds.filterOrigin}
        />
    );
}

export const FilterOriginMemo = memo(FilterOrigin);

type FilterOriginLoaderProps = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

// NOTE: We can get rid of this once STL-1754 is fixed
export function FilterOriginGuard({ backend, workspace, children }: FilterOriginLoaderProps) {
    const { result: workspaceDescriptor, status } = useCancelablePromise(
        {
            promise: () => backend.workspace(workspace).getDescriptor(),
        },
        [backend, workspace],
    );

    // Hide the filter if the workspace has no parent workspace
    if (status !== "success" || !workspaceDescriptor?.parentWorkspace) {
        return null;
    }

    return <>{children}</>;
}
