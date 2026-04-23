// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { CatalogDetail } from "../catalogDetail/CatalogDetail.js";
import type { OpenHandlerEvent } from "../catalogDetail/types.js";
import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { CatalogItemFeed } from "../catalogItem/CatalogItemFeed.js";
import { type ICatalogItem, type ICatalogItemRef } from "../catalogItem/types.js";
import { FilterCertificationMemo } from "../filter/FilterCertification.js";
import { useFilterActions } from "../filter/FilterContext.js";
import { FilterCreatedByMemo } from "../filter/FilterCreatedBy.js";
import { FilterGroupLayout } from "../filter/FilterGroupLayout.js";
import { FilterObjectTypeMemo } from "../filter/FilterObjectType.js";
import { FilterOriginGuard, FilterOriginMemo } from "../filter/FilterOrigin.js";
import { FilterQualityMemo } from "../filter/FilterQuality.js";
import { FilterResetButtonMemo } from "../filter/FilterResetButton.js";
import { FilterTagsMemo } from "../filter/FilterTags.js";
import { FilterVisibilityMemo } from "../filter/FilterVisibility.js";
import { ObjectTypes } from "../objectType/constants.js";
import { useIsCatalogQualityEnabled } from "../quality/gate.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    open: boolean;
    openedItem: ICatalogItemRef | ICatalogItem | null;
    setItemOpened: (item: ICatalogItemRef | ICatalogItem | null) => void;
    onOpenDetail: (item: ICatalogItem) => void;
    onCloseDetail: () => void;
    onOpenClick: (event: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
};

const messages = defineMessages({
    updateFailed: { id: "analyticsCatalog.catalogItem.update.failed" },
    showLess: { id: "analyticsCatalog.showLess" },
    showMore: { id: "analyticsCatalog.showMore" },
});

export function Main({
    backend,
    workspace,
    open,
    openedItem,
    setItemOpened,
    onOpenDetail,
    onCloseDetail,
    onOpenClick,
    onCatalogItemNavigation,
}: Props) {
    const intl = useIntl();
    const { addError } = useToastMessage();
    const { toggleTag } = useFilterActions();
    const { updateItem, removeItem, refetchObjectType } = useCatalogFeedActions();
    const isQualityEnabled = useIsCatalogQualityEnabled();

    return (
        <section className="gd-analytics-catalog__main">
            <div className="gd-analytics-catalog__main__filters">
                <FilterObjectTypeMemo />
                <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.title" />}>
                    <FilterCreatedByMemo backend={backend} workspace={workspace} />
                    <FilterTagsMemo />
                    <FilterOriginGuard backend={backend} workspace={workspace}>
                        <FilterOriginMemo />
                    </FilterOriginGuard>
                    {isQualityEnabled ? <FilterQualityMemo /> : null}
                    <FilterVisibilityMemo />
                    <FilterCertificationMemo />
                    <FilterResetButtonMemo />
                </FilterGroupLayout>
            </div>
            <CatalogItemFeed>
                {({ items, next, hasNext, totalCount, status }) => (
                    <Table
                        status={status}
                        items={items}
                        next={next}
                        hasNext={hasNext}
                        totalCount={totalCount}
                        onItemClick={onOpenDetail}
                        onTagClick={toggleTag}
                    />
                )}
            </CatalogItemFeed>
            <CatalogDetail
                open={open}
                objectDefinition={openedItem}
                onClose={onCloseDetail}
                onOpenClick={onOpenClick}
                onCatalogItemNavigation={(event, ref) => {
                    setItemOpened(ref);
                    onCatalogItemNavigation?.(event, ref);
                }}
                onCatalogItemCreate={(item) => {
                    setItemOpened(item);
                    refetchObjectType(ObjectTypes.PARAMETER);
                }}
                onCatalogItemUpdate={(item) => {
                    setItemOpened(item);
                    updateItem(item);
                }}
                onCatalogItemDelete={(ref) => {
                    removeItem(ref);
                    refetchObjectType(ObjectTypes.PARAMETER);
                    onCloseDetail();
                }}
                onCatalogItemUpdateError={(err) => {
                    addError(messages.updateFailed, {
                        showLess: intl.formatMessage(messages.showLess),
                        showMore: intl.formatMessage(messages.showMore),
                        errorDetail: `${err.name} ${err.message}`,
                    });
                }}
            />
        </section>
    );
}
