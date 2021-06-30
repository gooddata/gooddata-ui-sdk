// (C) 2021 GoodData Corporation
import React, { useMemo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { useBrokenAlertFiltersMeta } from "./useBrokenAlertFiltersMeta";
import { useDashboardSelector, selectCatalogDateDatasets } from "../../model";
import {
    enrichBrokenAlertsInfo,
    IBrokenAlertFilterBasicInfo,
    IKpiAlertDialogProps,
    KpiAlertDialog,
} from "./KpiAlerts";

interface IKpiAlertDialogWrapperProps
    extends WrappedComponentProps,
        Omit<IKpiAlertDialogProps, "brokenAlertFilters" | "intl"> {
    brokenAlertFiltersBasicInfo: IBrokenAlertFilterBasicInfo[];
    backend: IAnalyticalBackend;
    workspace: string;
}

const KpiAlertDialogWrapperCore: React.FC<IKpiAlertDialogWrapperProps> = (props) => {
    const { brokenAlertFiltersBasicInfo, backend, workspace, intl, ...restProps } = props;
    const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);

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
