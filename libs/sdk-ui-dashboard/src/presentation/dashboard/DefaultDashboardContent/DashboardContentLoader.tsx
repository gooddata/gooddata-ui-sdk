// (C) 2026 GoodData Corporation

import { type CSSProperties, useState } from "react";

import { FormattedMessage } from "react-intl";

import { UiSkeleton } from "@gooddata/sdk-ui-kit";

interface IDashboardContentLoaderRow {
    widths: number[];
}

function createDashboardContentLoaderRow(): IDashboardContentLoaderRow {
    if (Math.random() < 0.5) {
        return { widths: [50, 50] };
    }

    const firstDivider = Math.floor(Math.random() * 41);
    const secondDivider = Math.floor(Math.random() * 41);
    const [lowerDivider, upperDivider] = [firstDivider, secondDivider].sort((a, b) => a - b);

    return {
        widths: [20 + lowerDivider, 20 + upperDivider - lowerDivider, 60 - upperDivider],
    };
}

/**
 * @internal
 */
export function DashboardContentLoader() {
    const [row] = useState(() => createDashboardContentLoaderRow());

    return (
        <div className="gd-dashboard-content-loader" role="status">
            <span className="gd-dashboard-content-loader__status">
                <FormattedMessage id="loading" />
            </span>
            <div
                className="gd-dashboard-content-loader__charts"
                data-testid="dashboard-content-loader-row"
                aria-hidden="true"
                style={
                    {
                        "--dashboard-content-loader-columns": row.widths
                            .map((width) => `minmax(0, ${width}fr)`)
                            .join(" "),
                    } as CSSProperties
                }
            >
                {Array.from({ length: row.widths.length }, (_, index) => (
                    <div
                        className="gd-dashboard-content-loader__chart"
                        data-testid="dashboard-content-loader-chart"
                        key={index}
                    >
                        <UiSkeleton itemHeight={440} itemWidth="45%" />
                    </div>
                ))}
            </div>
        </div>
    );
}
