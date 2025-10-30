// (C) 2025 GoodData Corporation

import cx from "classnames";
import { IntlShape, useIntl } from "react-intl";

import { IUiListboxInteractiveItem, UiIcon, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { KdaKeyDriverChart } from "../components/KdaKeyDriverChart.js";
import { KdaSummaryDrivers } from "../components/KdaSummaryDrivers.js";
import { KdaSummaryHeadline } from "../components/KdaSummaryHeadline.js";
import { KdaItem, KdaState } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";
import { useDataViewWithConfig } from "./hooks/useDataViewWithConfig.js";
import { useGroupAndItem } from "./hooks/useGroupAndItem.js";

export interface KeyDriversOverviewProps {
    loading?: boolean;
    detailsId?: string;
}

export function KeyDriversOverview({ loading, detailsId }: KeyDriversOverviewProps) {
    const { state } = useKdaState();

    if (state.selectedItem === "summary" || loading) {
        return <KeyDriversSummary loading={loading} detailsId={detailsId} />;
    }

    return <KeyDriversDetail detailsId={detailsId} />;
}

interface KeyDriversSummaryProps {
    loading?: boolean;
    detailsId?: string;
}

function KeyDriversSummary({ loading, detailsId }: KeyDriversSummaryProps) {
    const intl = useIntl();
    const { state } = useKdaState();
    const summaryLoading = getSummaryLoading(state, loading);

    return (
        <div className={cx("gd-kda-key-drivers-overview")} id={detailsId}>
            <div className={cx("gd-kda-key-drivers-overview-title")}>
                {summaryLoading ? (
                    <UiSkeleton itemWidth={200} itemHeight={26} />
                ) : (
                    intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.summary.title" })
                )}
            </div>
            <div className={cx("gd-kda-key-drivers-overview-headline")}>
                {summaryLoading ? <UiSkeleton itemWidth={420} itemHeight={20} /> : <KdaSummaryHeadline />}
            </div>
            <div className={cx("gd-kda-key-drivers-overview-drivers")}>
                {loading ? <UiSkeleton itemWidth={618} itemHeight={370} /> : <KdaSummaryDrivers />}
            </div>
        </div>
    );
}

interface KeyDriversDetailsProps {
    detailsId?: string;
}

function KeyDriversDetail({ detailsId }: KeyDriversDetailsProps) {
    const intl = useIntl();
    const { state } = useKdaState();

    const description = getDescription(state.selectedItem);
    const category = getCategory(state.selectedItem);

    const { group, item } = useGroupAndItem();
    const { config, dataView, displayForm } = useDataViewWithConfig(group, item);

    return (
        <div className={cx("gd-kda-key-drivers-detail")} id={detailsId}>
            <div>
                <div className={cx("gd-kda-key-drivers-detail-title")}>
                    {getTitle(intl, state.selectedItem)}
                </div>
                {description ? (
                    <div className={cx("gd-kda-key-drivers-detail-description")}>{description}</div>
                ) : null}
            </div>
            <div className={cx("gd-kda-key-drivers-detail-visualisation")}>
                <KdaKeyDriverChart config={config} dataView={dataView} displayForm={displayForm} />
            </div>
            <div className={cx("gd-kda-key-drivers-detail-info")}>
                <UiIcon type="questionMark" size={12} />{" "}
                {intl.formatMessage(
                    { id: "kdaDialog.dialog.keyDrives.overview.detail.tip" },
                    {
                        category,
                    },
                )}
            </div>
        </div>
    );
}

function getTitle(intl: IntlShape, item: IUiListboxInteractiveItem<KdaItem> | string) {
    if (typeof item === "string") {
        return "";
    }
    return intl.formatMessage(
        { id: "kdaDialog.dialog.keyDrives.overview.detail.title" },
        {
            title: item.data.title,
            category: item.data.category,
        },
    );
}

function getDescription(item: IUiListboxInteractiveItem<KdaItem> | string) {
    if (typeof item === "string") {
        return "";
    }
    return item.data.description;
}

function getCategory(item: IUiListboxInteractiveItem<KdaItem> | string) {
    if (typeof item === "string") {
        return "";
    }
    return item.data.category;
}

function getSummaryLoading(state: KdaState, globalLoading?: boolean) {
    if (state.definition) {
        const from = state.definition.range[0];
        const to = state.definition.range[1];
        return from.value === undefined || to.value === undefined;
    }
    return globalLoading ?? false;
}
