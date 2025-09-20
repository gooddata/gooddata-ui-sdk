// (C) 2025 GoodData Corporation

import { type MouseEvent, type MutableRefObject, useRef, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useCatalogItemOpen } from "./hooks/useCatalogItemOpen.js";
import { CatalogDetail } from "../catalogDetail/CatalogDetail.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import { CatalogItemFeed, type ICatalogItemRef } from "../catalogItem/index.js";
import {
    FilterGroupByMemo,
    FilterObjectTypeMemo,
    FilterOriginGuard,
    FilterOriginMemo,
    FilterTagsMemo,
} from "../filter/index.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    openCatalogItemRef?: ICatalogItemRef;
    onCatalogItemOpenClick?: (e: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
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
}: Props) {
    const intl = useIntl();
    const { addError } = useToastMessage();

    const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
    const ref = useRef<HTMLElement | null>(null);

    const { open, openedItem, setItemOpened, onOpenDetail, onCloseDetail, onOpenClick } = useCatalogItemOpen(
        onCatalogItemOpenClick,
        onCatalogDetailOpened,
        onCatalogDetailClosed,
        openCatalogItemRef,
    );

    return (
        <section className="gd-analytics-catalog__main" ref={ref as MutableRefObject<HTMLDivElement>}>
            <header>
                <FilterObjectTypeMemo />
                <FilterGroupByMemo backend={backend} workspace={workspace} onChange={setSelectedCreatedBy} />
                <FilterTagsMemo backend={backend} workspace={workspace} />
                <FilterOriginGuard backend={backend} workspace={workspace}>
                    <FilterOriginMemo />
                </FilterOriginGuard>
            </header>
            <CatalogItemFeed backend={backend} workspace={workspace} createdBy={selectedCreatedBy}>
                {({ items, next, hasNext, totalCount, status, updateItem }) => (
                    <>
                        <Table
                            status={status}
                            items={items}
                            next={next}
                            hasNext={hasNext}
                            totalCount={totalCount}
                            onItemClick={onOpenDetail}
                        />
                        <CatalogDetail
                            open={open}
                            objectDefinition={openedItem}
                            node={ref.current ?? undefined}
                            onClose={onCloseDetail}
                            onOpenClick={onOpenClick}
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
