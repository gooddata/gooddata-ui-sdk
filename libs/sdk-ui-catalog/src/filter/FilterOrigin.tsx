// (C) 2025 GoodData Corporation

import { type PropsWithChildren, memo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { DropdownInvertableSelect } from "@gooddata/sdk-ui-kit";

import { useFilterActions } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
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

    const handleChange = (selection: OriginOption[], isInverted: boolean) => {
        const optionsSet = new Set(options);
        const selectionSet = new Set(selection);
        const nextSelection = isInverted
            ? options.filter((item) => !selectionSet.has(item))
            : selection.filter((item) => optionsSet.has(item));

        if (nextSelection.length === options.length) {
            setOrigin("ALL");
        } else {
            const [origin] = nextSelection;
            if (origin) {
                setOrigin(origin);
            }
        }
    };

    return (
        <FilterGroupLayout
            title={<FormattedMessage id="analyticsCatalog.filter.origin.title" />}
            data-testid={testIds.filterOrigin}
        >
            <DropdownInvertableSelect
                options={options}
                alignPoints={[{ align: "bl tl" }, { align: "br tr" }]}
                getItemTitle={(item) => intl.formatMessage(messages[item])}
                getItemKey={(item) => item}
                onChange={handleChange}
                header={
                    <div className="gd-list-title gd-analytics-catalog__filter__header">
                        <FormattedMessage id="analyticsCatalog.filter.origin.title" />
                    </div>
                }
                renderSearchBar={() => <div className="gd-analytics-catalog__filter__search-bar" />}
            />
        </FilterGroupLayout>
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
