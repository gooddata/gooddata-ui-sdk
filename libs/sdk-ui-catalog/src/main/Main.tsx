// (C) 2025 GoodData Corporation

import React, { useRef, useState } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IdentifierRef } from "@gooddata/sdk-model";

import { GroupLayout } from "./GroupLayout.js";
import { useCatalogItemOpen } from "./hooks/useCatalogItemOpen.js";
import { CatalogDetail } from "../catalogDetail/CatalogDetail.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import { CatalogItemFeed } from "../catalogItem/CatalogItemFeed.js";
import { FilterGroupByMemo, FilterTagsMemo } from "../filter/index.js";
import { type ObjectType, ObjectTypeSelectMemo } from "../objectType/index.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    openCatalogItemRef?: IdentifierRef;
    onCatalogItemOpenClick?: (e: React.MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    onCatalogDetailOpened?: (ref: IdentifierRef) => void;
    onCatalogDetailClosed?: () => void;
};

export function Main({
    openCatalogItemRef,
    backend,
    workspace,
    onCatalogItemOpenClick,
    onCatalogDetailOpened,
    onCatalogDetailClosed,
}: Props) {
    const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
    const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const ref = useRef<HTMLElement | null>(null);

    const { open, openedItem, onOpenDetail, onCloseDetail, onOpenClick } = useCatalogItemOpen(
        onCatalogItemOpenClick,
        onCatalogDetailOpened,
        onCatalogDetailClosed,
        openCatalogItemRef,
    );

    return (
        <section className="gd-analytics-catalog__main" ref={ref as React.MutableRefObject<HTMLDivElement>}>
            <header>
                <GroupLayout
                    className="gd-analytics-catalog__object-type"
                    title={<FormattedMessage id="analyticsCatalog.objectType.title" />}
                >
                    <ObjectTypeSelectMemo selectedTypes={selectedTypes} onSelect={setSelectedTypes} />
                </GroupLayout>
                <GroupLayout title={<FormattedMessage id="analyticsCatalog.filter.createdBy.title" />}>
                    <FilterGroupByMemo
                        backend={backend}
                        workspace={workspace}
                        onChange={setSelectedCreatedBy}
                    />
                </GroupLayout>
                <GroupLayout title={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}>
                    <FilterTagsMemo backend={backend} workspace={workspace} onChange={setSelectedTags} />
                </GroupLayout>
            </header>
            <CatalogItemFeed
                types={selectedTypes}
                backend={backend}
                workspace={workspace}
                createdBy={selectedCreatedBy}
                tags={selectedTags}
            >
                {({ items, next, hasNext, totalCount, status }) => (
                    <Table
                        status={status}
                        items={items}
                        next={next}
                        hasNext={hasNext}
                        totalCount={totalCount}
                        onItemClick={onOpenDetail}
                        onTagClick={(_tag) => {
                            //TODO: setSelectedTags([tag]);
                        }}
                    />
                )}
            </CatalogItemFeed>
            <CatalogDetail
                open={open}
                objectDefinition={openedItem}
                node={ref.current ?? undefined}
                onClose={onCloseDetail}
                onOpenClick={onOpenClick}
                onTagClick={(_tag) => {
                    //TODO: setSelectedTags([tag]);
                    // setOpen(false);
                }}
            />
        </section>
    );
}
