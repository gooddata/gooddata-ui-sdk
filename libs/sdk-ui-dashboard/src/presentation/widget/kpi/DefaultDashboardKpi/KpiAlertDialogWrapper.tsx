// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import {
    IAnalyticalBackend,
    ICatalogDateDataset,
    IDashboardDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import compact from "lodash/compact";

import { IBrokenAlertFilterBasicInfo, useDashboardQueryProcessing } from "../../../../model";

import { enrichBrokenAlertsInfo, IKpiAlertDialogProps, KpiAlertDialog } from "./KpiAlerts";
import { useBrokenAlertFiltersMeta } from "./useBrokenAlertFiltersMeta";
import { queryCatalogDateDatasets } from "../../../../model";

interface IKpiAlertDialogWrapperProps
    extends WrappedComponentProps,
        Omit<IKpiAlertDialogProps, "brokenAlertFilters" | "intl"> {
    brokenAlertFiltersBasicInfo: IBrokenAlertFilterBasicInfo[];
    backend: IAnalyticalBackend;
    workspace: string;
}

const KpiAlertDialogWrapperCore: React.FC<IKpiAlertDialogWrapperProps> = (props) => {
    const { brokenAlertFiltersBasicInfo, backend, workspace, intl, ...restProps } = props;
    // const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);

    const brokenDateFiltersInfo: IDashboardDateFilter[] =
        brokenAlertFiltersBasicInfo
            ?.map((basicInfo) => basicInfo.alertFilter)
            .filter(isDashboardDateFilter) || [];
    const dateDatasetRefs = compact(brokenDateFiltersInfo.map((info) => info.dateFilter.attribute));

    const { result: dateDatasetQueryResult, run: runDateDatasetsQuery } = useDashboardQueryProcessing({
        queryCreator: queryCatalogDateDatasets,
    });

    useEffect(() => {
        runDateDatasetsQuery(dateDatasetRefs);
    }, [brokenAlertFiltersBasicInfo]);

    const dateDatasets = dateDatasetQueryResult as ICatalogDateDataset[];

    const { result: brokenAlertFiltersMeta, status } = useBrokenAlertFiltersMeta({
        dateDatasets,
        backend,
        workspace,
        brokenAlertFilters: brokenAlertFiltersBasicInfo,
    });

    const brokenAlertFilters = useMemo(() => {
        if (!brokenAlertFiltersMeta) {
            return null;
        }

        return enrichBrokenAlertsInfo(
            brokenAlertFiltersBasicInfo,
            intl,
            restProps.dateFormat,
            brokenAlertFiltersMeta.dateDatasets,
            brokenAlertFiltersMeta.attributeFiltersMeta,
        );
    }, [brokenAlertFiltersMeta, restProps.dateFormat]);

    return (
        <KpiAlertDialog
            {...restProps}
            isAlertDialogOpening={status === "loading"}
            brokenAlertFilters={brokenAlertFilters!}
        />
    );
};

export const KpiAlertDialogWrapper = injectIntl(KpiAlertDialogWrapperCore);
