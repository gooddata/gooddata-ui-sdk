// (C) 2021 GoodData Corporation
import invariant from "ts-invariant";
import {
    AnalyticalBackendError,
    IAnalyticalBackend,
    IDataSetMetadataObject,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    useBackend,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { isAttributeElementsByRef, objRefToString } from "@gooddata/sdk-model";

import { dateDatasetsDataLoaderFactory } from "../../dataLoaders";

import {
    IAttributeFilterMetaCollection,
    IBrokenAlertFilterBasicInfo,
    isBrokenAlertAttributeFilterInfo,
} from "../../internal/dashboardEmbedding";

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
    brokenAlertFilters: IBrokenAlertFilterBasicInfo[];

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
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    invariant(
        effectiveBackend,
        "The backend in useBrokenAlertFiltersMeta must be defined. Either pass it as a config prop or make sure there is a BackendProvider up the component tree.",
    );

    invariant(
        effectiveWorkspace,
        "The workspace in useBrokenAlertFiltersMeta must be defined. Either pass it as a config prop or make sure there is a WorkspaceProvider up the component tree.",
    );

    const promise = brokenAlertFilters
        ? async (): Promise<IBrokenAlertFiltersMeta> => {
              const filtersToLoad = brokenAlertFilters.filter(isBrokenAlertAttributeFilterInfo);

              const dateDatasetLoader = dateDatasetsDataLoaderFactory.forWorkspace(effectiveWorkspace);
              const dateDatasetsPromise = dateDatasetLoader.getDateDatasets(effectiveBackend);

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

                      const [elements, displayFormData] = await Promise.all([
                          attributesService
                              .elements()
                              .forDisplayForm(displayForm)
                              .withLimit(DEFAULT_ATTRIBUTE_ELEMENT_COUNT)
                              .withOptions({
                                  uris: attributeFilter.negativeSelection
                                      ? undefined // for negative filters we need to load the items NOT selected, however there is no way of doing that, so we load everything
                                      : attributeFilter.attributeElements.uris,
                                  includeTotalCountWithoutFilters: true,
                              })
                              .query(),
                          attributesService.getAttributeDisplayForm(displayForm),
                      ]);

                      return {
                          elements,
                          displayForm,
                          title: displayFormData.title,
                      };
                  }),
              );

              const [filterData, dateDatasets] = await Promise.all([filterDataPromise, dateDatasetsPromise]);

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
