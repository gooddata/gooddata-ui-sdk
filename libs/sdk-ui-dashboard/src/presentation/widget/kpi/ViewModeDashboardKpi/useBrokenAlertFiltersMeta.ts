// (C) 2021-2022 GoodData Corporation
import {
    AnalyticalBackendError,
    IAnalyticalBackend,
    NotSupported,
    IElementsQueryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import {
    isAttributeElementsByRef,
    objRefToString,
    ICatalogDateDataset,
    IDataSetMetadataObject,
} from "@gooddata/sdk-model";

import { IAttributeFilterMetaCollection } from "./KpiAlerts/index.js";

import { IBrokenAlertFilterBasicInfo, isBrokenAlertAttributeFilterInfo } from "../../../../model/index.js";

export interface IBrokenAlertFiltersMeta {
    attributeFiltersMeta: IAttributeFilterMetaCollection;
    dateDatasets: IDataSetMetadataObject[];
}

/**
 * @internal
 */
export interface IUseEnrichedBrokenAlertsConfig
    extends UseCancelablePromiseCallbacks<IBrokenAlertFiltersMeta, AnalyticalBackendError> {
    /**
     * Broken filters to get meta data for.
     */
    brokenAlertFilters?: IBrokenAlertFilterBasicInfo[];

    /**
     * Date data sets
     */
    dateDatasets: ICatalogDateDataset[];

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the hook MUST be called within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the insight exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the hook MUST be called within an existing WorkspaceContext.
     */
    workspace?: string;
}

/**
 * the amount of elements to load, this should be small enough to be efficient,
 * and large enough to always be longer than the broken alert filters display
 */
const DEFAULT_ATTRIBUTE_ELEMENT_COUNT = 20;

/**
 * @internal
 */
export function useBrokenAlertFiltersMeta({
    backend,
    brokenAlertFilters,
    dateDatasets,
    workspace,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseEnrichedBrokenAlertsConfig): UseCancelablePromiseState<
    IBrokenAlertFiltersMeta,
    AnalyticalBackendError
> {
    const effectiveBackend = useBackendStrict(backend, "useBrokenAlertFiltersMeta");
    const effectiveWorkspace = useWorkspaceStrict(workspace, "useBrokenAlertFiltersMeta");

    const promise = brokenAlertFilters
        ? async (): Promise<IBrokenAlertFiltersMeta> => {
              const filtersToLoad = brokenAlertFilters.filter(isBrokenAlertAttributeFilterInfo);

              const filterDataPromise = Promise.all(
                  filtersToLoad.map(async (filter) => {
                      const { attributeFilter } = filter.alertFilter;

                      if (!isAttributeElementsByRef(attributeFilter.attributeElements)) {
                          throw new NotSupported(
                              "Only URI attribute filters are supported in useBrokenAlertFiltersMeta",
                          );
                      }

                      const displayForm = attributeFilter.displayForm;

                      const attributesService = effectiveBackend.workspace(effectiveWorkspace).attributes();

                      const elementsQueryOptions: IElementsQueryOptions = {
                          elements: attributeFilter.negativeSelection
                              ? undefined // for negative filters we need to load the items NOT selected, however there is no way of doing that, so we load everything
                              : effectiveBackend.capabilities.supportsElementUris
                              ? {
                                    uris: attributeFilter.attributeElements.uris,
                                }
                              : {
                                    primaryValues: attributeFilter.attributeElements.uris,
                                },
                          includeTotalCountWithoutFilters: true,
                      };

                      const [elements, displayFormData] = await Promise.all([
                          attributesService
                              .elements()
                              .forDisplayForm(displayForm)
                              .withLimit(DEFAULT_ATTRIBUTE_ELEMENT_COUNT)
                              .withOptions(elementsQueryOptions)
                              .query(),
                          attributesService.getAttributeDisplayForm(displayForm),
                      ]);

                      const attribute = await attributesService.getAttribute(displayFormData.attribute);

                      return {
                          elements,
                          displayForm,
                          title: attribute.title,
                      };
                  }),
              );

              const filterData = await filterDataPromise;

              const attributeFiltersMeta = filterData.reduce((acc: IAttributeFilterMetaCollection, curr) => {
                  acc[objRefToString(curr.displayForm)] = {
                      title: curr.title,
                      totalElementsCount: curr.elements.totalCount,
                      validElements: curr.elements.items,
                  };
                  return acc;
              }, {});

              return {
                  attributeFiltersMeta,
                  dateDatasets: dateDatasets.map((ds) => ds.dataSet),
              };
          }
        : null;

    return useCancelablePromise({ promise, onCancel, onError, onLoading, onPending, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        brokenAlertFilters,
    ]);
}
