// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getParentFilterTitles } from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";

interface IUseParentFilterTitlesProps {
    context: Pick<AttributeFilterButtonContextProps, "backend" | "workspace">;
    ownProps: Pick<AttributeFilterButtonHookOwnProps, "parentFilters">;
}

export const useParentFilterTitles = (props: IUseParentFilterTitlesProps) => {
    const { context, ownProps } = props;

    return useCancelablePromise<string[]>(
        {
            promise: () =>
                getParentFilterTitles(ownProps.parentFilters ?? [], context.backend, context.workspace),
        },
        [context.backend, context.workspace, stringify(ownProps.parentFilters)],
    );
};
