// (C) 2025 GoodData Corporation

import React, { useState } from "react";

import { FormattedMessage } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { GroupLayout } from "./GroupLayout.js";
import { StaticFilter } from "../filter/StaticFilter.js";
import { type ObjectType, ObjectTypeSelectMemo } from "../objectType/index.js";

type Props = {
    backend?: IAnalyticalBackend;
    workspace?: string;
};

export function Main({ workspace }: Props) {
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
                    <StaticFilter options={["John Goodman", "Jane Goodwomen"]} onChange={setSelectedOwners} />
                </GroupLayout>
                <GroupLayout title={<FormattedMessage id="analyticsCatalog.filter.tags.title" />}>
                    <StaticFilter options={["Executive", "HR"]} onChange={setSelectedTags} />
                </GroupLayout>
            </header>
            <div>workspace: {workspace}</div>
        </section>
    );
}
