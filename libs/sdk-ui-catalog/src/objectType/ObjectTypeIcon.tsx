// (C) 2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import type { ObjectType } from "./types.js";

type Props = {
    type: ObjectType;
};

export function ObjectTypeIcon({ type }: Props) {
    return (
        <div className={cx("gd-analytics-catalog__object-type", "gd-analytics-catalog__table__column-icon")}>
            <div data-object-type={type}>
                {type === "attribute" ? <UiIcon type="ldmAttribute" size={14} backgroundSize={27} /> : null}
                {type === "fact" ? <UiIcon type="fact" size={14} backgroundSize={27} /> : null}
                {type === "measure" ? <UiIcon type="metric" size={14} backgroundSize={27} /> : null}
                {type === "analyticalDashboard" ? (
                    <UiIcon type="dashboard" size={14} backgroundSize={27} />
                ) : null}
                {type === "insight" ? <UiIcon type="visualization" size={14} backgroundSize={27} /> : null}
            </div>
        </div>
    );
}
