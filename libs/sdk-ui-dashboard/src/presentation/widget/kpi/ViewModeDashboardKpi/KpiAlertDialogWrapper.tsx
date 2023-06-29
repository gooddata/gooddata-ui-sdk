// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import {
    useDashboardSelector,
    selectCatalogDateDatasets,
    IBrokenAlertFilterBasicInfo,
} from "../../../../model/index.js";

import { enrichBrokenAlertsInfo, IKpiAlertDialogProps, KpiAlertDialog } from "./KpiAlerts/index.js";
import { useBrokenAlertFiltersMeta } from "./useBrokenAlertFiltersMeta.js";

interface IKpiAlertDialogWrapperProps extends Omit<IKpiAlertDialogProps, "brokenAlertFilters" | "intl"> {
    brokenAlertFiltersBasicInfo: IBrokenAlertFilterBasicInfo[];
    backend: IAnalyticalBackend;
    workspace: string;
}

export const KpiAlertDialogWrapper: React.FC<IKpiAlertDialogWrapperProps> = (props) => {
    const { brokenAlertFiltersBasicInfo, backend, workspace, ...restProps } = props;
    const intl = useIntl();
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
    }, [brokenAlertFiltersBasicInfo, brokenAlertFiltersMeta, intl, restProps.dateFormat]);

    return (
        <KpiAlertDialog
            {...restProps}
            isAlertDialogOpening={status === "loading"}
            brokenAlertFilters={brokenAlertFilters!}
        />
    );
};
