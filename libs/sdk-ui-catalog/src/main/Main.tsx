// (C) 2025 GoodData Corporation

import React, { useState } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { type ObjectType, ObjectTypeLayout, ObjectTypeSelectMemo } from "../objectType/index.js";

type Props = {
    backend?: IAnalyticalBackend;
    workspace?: string;
};

export function Main({ workspace }: Props) {
    const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);

    return (
        <section className="gd-analytics-catalog__main">
            <header>
                <ObjectTypeLayout>
                    <ObjectTypeSelectMemo selectedTypes={selectedTypes} onSelect={setSelectedTypes} />
                </ObjectTypeLayout>
            </header>
            <div>workspace: {workspace}</div>
        </section>
    );
}
