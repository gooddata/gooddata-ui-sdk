// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getParentFilterTitles } from "../../utils/AttributeFilterUtils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import stringify from "json-stable-stringify";

interface IUseParentFilterTitlesProps {
    backend: IAnalyticalBackend;
    workspace: string;
    resolvedParentFilters: IAttributeFilter[];
}

export const useParentFilterTitles = (props: IUseParentFilterTitlesProps) => {

    return useCancelablePromise<string[]>(
        {
            promise: () => getParentFilterTitles(props.resolvedParentFilters ?? [], props.backend, props.workspace),
        },
        [props.backend, props.workspace, stringify(props.resolvedParentFilters)],
    );
};
