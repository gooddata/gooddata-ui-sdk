// (C) 2025 GoodData Corporation

import React, { useRef, useState } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { GroupLayout } from "./GroupLayout.js";
import { CatalogDetail } from "../catalogDetail/CatalogDetail.js";
import { CatalogItemFeed } from "../catalogItem/CatalogItemFeed.js";
import type { ICatalogItem } from "../catalogItem/types.js";
import { FilterGroupByMemo, FilterTagsMemo } from "../filter/index.js";
import { type ObjectType, ObjectTypeSelectMemo } from "../objectType/index.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function Main({ backend, workspace }: Props) {
    const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
    const [selectedCreatedBy, setSelectedCreatedBy] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [opened, setOpened] = useState<ICatalogItem | null>(null);
    const ref = useRef<HTMLElement | null>(null);

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
                        onItemClick={setOpened}
                    />
                )}
            </CatalogItemFeed>
            <CatalogDetail
                open={Boolean(opened)}
                objectId={opened?.id}
                node={ref.current ?? undefined}
                onClose={() => setOpened(null)}
            />
        </section>
    );
}
