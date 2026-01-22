// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useCatalogItemOpen } from "./hooks/useCatalogItemOpen.js";
import { CatalogDetail } from "../catalogDetail/CatalogDetail.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import { CatalogItemFeed } from "../catalogItem/CatalogItemFeed.js";
import { type ICatalogItemRef } from "../catalogItem/types.js";
import { useFilterActions } from "../filter/FilterContext.js";
import { FilterCreatedByMemo } from "../filter/FilterCreatedBy.js";
import { FilterGroupLayout } from "../filter/FilterGroupLayout.js";
import { FilterObjectTypeMemo } from "../filter/FilterObjectType.js";
import { FilterOriginGuard, FilterOriginMemo } from "../filter/FilterOrigin.js";
import { FilterQualityMemo } from "../filter/FilterQuality.js";
import { FilterResetButtonMemo } from "../filter/FilterResetButton.js";
import { FilterTagsMemo } from "../filter/FilterTags.js";
import { FilterVisibilityMemo } from "../filter/FilterVisibility.js";
import { useIsCatalogQualityEnabled } from "../quality/gate.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    openCatalogItemRef?: ICatalogItemRef;
    onCatalogItemOpenClick?: (event: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    onCatalogItemNavigation?: (event: MouseEvent, ref: ICatalogItemRef) => void;
    onCatalogDetailOpened?: (ref: ICatalogItemRef) => void;
    onCatalogDetailClosed?: () => void;
};

const messages = defineMessages({
    updateFailed: { id: "analyticsCatalog.catalogItem.update.failed" },
    showLess: { id: "analyticsCatalog.showLess" },
    showMore: { id: "analyticsCatalog.showMore" },
});

export function Main({
    openCatalogItemRef,
    backend,
    workspace,
    onCatalogItemOpenClick,
    onCatalogDetailOpened,
    onCatalogDetailClosed,
    onCatalogItemNavigation,
}: Props) {
    const intl = useIntl();
    const { addError } = useToastMessage();
    const { toggleTag } = useFilterActions();
    const isQualityEnabled = useIsCatalogQualityEnabled();

    const { open, openedItem, setItemOpened, onOpenDetail, onCloseDetail, onOpenClick } = useCatalogItemOpen(
        onCatalogItemOpenClick,
        onCatalogDetailOpened,
        onCatalogDetailClosed,
        openCatalogItemRef,
    );

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
                    <FilterResetButtonMemo />
                </FilterGroupLayout>
            </div>
            <CatalogItemFeed backend={backend} workspace={workspace}>
                {({ items, next, hasNext, totalCount, status, updateItem }) => (
                    <>
                        <Table
                            status={status}
                            items={items}
                            next={next}
                            hasNext={hasNext}
                            totalCount={totalCount}
                            onItemClick={onOpenDetail}
                            onTagClick={toggleTag}
                        />
                        <CatalogDetail
                            open={open}
                            objectDefinition={openedItem}
                            onClose={onCloseDetail}
                            onOpenClick={onOpenClick}
                            onCatalogItemNavigation={(event, ref) => {
                                setItemOpened(ref);
                                onCatalogItemNavigation?.(event, ref);
                            }}
                            onCatalogItemUpdate={(item, changes) => {
                                setItemOpened(item);
                                updateItem(changes);
                            }}
                            onCatalogItemUpdateError={(err) => {
                                addError(messages.updateFailed, {
                                    showLess: intl.formatMessage(messages.showLess),
                                    showMore: intl.formatMessage(messages.showMore),
                                    errorDetail: `${err.name} ${err.message}`,
                                });
                            }}
                        />
                    </>
                )}
            </CatalogItemFeed>
        </section>
    );
}
