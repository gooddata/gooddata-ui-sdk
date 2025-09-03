// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

import { useFilterActions } from "./FilterContext.js";
import { testIds } from "../automation/index.js";

type OriginOption = Exclude<ObjectOrigin, "ALL">;

const options: OriginOption[] = ["PARENTS", "NATIVE"];

const messages: Record<OriginOption, MessageDescriptor> = defineMessages({
    PARENTS: { id: "analyticsCatalog.filter.origin.parents" },
    NATIVE: { id: "analyticsCatalog.filter.origin.native" },
});

export function FilterOrigin() {
    const intl = useIntl();
    const { setOrigin } = useFilterActions();

    const handleChange = (selection: OriginOption[]) => {
        if (selection.length === 0) {
            setOrigin("ALL");
        }
        const [origin] = selection;
        if (origin) {
            setOrigin(origin);
        }
    };

    return (
        <div data-testid={testIds.filterOrigin}>
            <DropdownInvertableSelect
                options={options}
                getItemTitle={(item) => intl.formatMessage(messages[item])}
                getItemKey={(item) => item}
                onChange={handleChange}
            />
        </div>
    );
}

export const FilterOriginMemo = memo(FilterOrigin);

type FilterOriginLoaderProps = React.PropsWithChildren<{
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
