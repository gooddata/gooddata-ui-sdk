// (C) 2025 GoodData Corporation

import React, { useState } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { GroupLayout } from "./GroupLayout.js";
import { testIds } from "../automation/index.js";
import { CatalogItemFeed } from "../catalogItem/CatalogItemFeed.js";
import { StaticFilter } from "../filter/StaticFilter.js";
import { type ObjectType, ObjectTypeSelectMemo } from "../objectType/index.js";
import { Table } from "../table/Table.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function Main({ backend, workspace }: Props) {
    const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
    const [, setSelectedOwners] = useState<string[]>([]);
    const [, setSelectedTags] = useState<string[]>([]);

    return (
        <section className="gd-analytics-catalog__main">
            <header>
                <GroupLayout
                    className="gd-analytics-catalog__object-type"
                    title={<FormattedMessage id="analyticsCatalog.objectType.title" />}
                >
                    <ObjectTypeSelectMemo selectedTypes={selectedTypes} onSelect={setSelectedTypes} />
                </GroupLayout>
                <GroupLayout title={<FormattedMessage id="analyticsCatalog.filter.createdBy.title" />}>
                    <StaticFilter
                        options={["John Goodman", "Jane Goodwomen"]}
                        onChange={setSelectedOwners}
                        dataTestId={`${testIds.filter}/created-by`}
                    />
                </GroupLayout>
                <GroupLayout title={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}>
                    <StaticFilter
                        options={["Executive", "HR"]}
                        onChange={setSelectedTags}
                        dataTestId={`${testIds.filter}/tags`}
                    />
                </GroupLayout>
            </header>
            <CatalogItemFeed types={selectedTypes} backend={backend} workspace={workspace}>
                {({ items }) => (
                    <Table
                        items={items}
                        onTagClick={(tag) => {
                            setSelectedTags([tag]);
                        }}
                    />
                )}
            </CatalogItemFeed>
        </section>
    );
}
