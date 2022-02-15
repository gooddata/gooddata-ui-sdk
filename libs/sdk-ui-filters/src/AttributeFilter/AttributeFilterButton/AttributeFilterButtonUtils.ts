// (C) 2022 GoodData Corporation
import { IAnalyticalBackend, IAttributeElement } from "@gooddata/sdk-backend-spi";
import { attributeElementsToAttributeElementArray } from "../utils/AttributeFilterUtils";
import { filterAttributeElements, IAttributeFilter, isNegativeAttributeFilter } from "@gooddata/sdk-model";
import { UseCancelablePromiseStatus } from "@gooddata/sdk-ui";

export const getInitialSelectedOptions = (currentFilter: IAttributeFilter): IAttributeElement[] => {
    // the as any cast is ok here, the data will get fixed once the element load completes
    // this serves only to have some initial state here so that when full element data is loaded
    // it automatically sets the props.filter.elements as selected
    return currentFilter
        ? (attributeElementsToAttributeElementArray(filterAttributeElements(currentFilter)) as any)
        : [];
};

export const getInitialIsInverted = (currentFilter: IAttributeFilter): boolean => {
    return currentFilter ? isNegativeAttributeFilter(currentFilter) : true;
};

export const areCancelablePromisesInPendingStatus = (
    cancelablePromiseStatuses: UseCancelablePromiseStatus[],
) => {
    return cancelablePromiseStatuses.some((status) => status === "pending");
};

export const areCancelablePromisesInLoadingState = (
    cancelablePromiseStatuses: UseCancelablePromiseStatus[],
) => {
    return cancelablePromiseStatuses.some((status) => status === "loading");
};

export const areCancelablePromisesLoading = (cancelablePromiseStatuses: UseCancelablePromiseStatus[]) => {
    return (
        areCancelablePromisesInLoadingState(cancelablePromiseStatuses) ||
        areCancelablePromisesInPendingStatus(cancelablePromiseStatuses)
    );
};

export const getBackend = (backend: IAnalyticalBackend, props: any) => {
    return backend.withTelemetry("AttributeFilter", props);
};
