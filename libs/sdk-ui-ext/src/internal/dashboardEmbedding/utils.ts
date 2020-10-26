// (C) 2020 GoodData Corporation

import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";

interface IUseResolvedFiltersConfig {
    widget: IWidget;
    filters: IFilter[] | undefined;
    backend?: IAnalyticalBackend;
    workspace?: string;
}

export const useResolvedFilters = ({
    widget,
    filters,
    backend,
    workspace,
}: IUseResolvedFiltersConfig): UseCancelablePromiseState<IFilter[], GoodDataSdkError> => {
    return useCancelablePromise({
        promise: () => {
            const effectiveBackend = useBackend(backend);
            const effectiveWorkspace = useWorkspace(workspace);

            return effectiveBackend
                .workspace(effectiveWorkspace)
                .dashboards()
                .getResolvedFiltersForWidget(widget, filters ?? []);
        },
    });
};
