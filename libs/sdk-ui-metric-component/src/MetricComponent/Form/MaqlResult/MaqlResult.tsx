// (C) 2021-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type ICatalogAttribute } from "@gooddata/sdk-model";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { Headline } from "@gooddata/sdk-ui-charts";
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { type IMeasureSetting } from "../../metric/metricHelpers.js";
import { type useExecute } from "../hooks/useExecute.js";

import { HeaderAction, MaqlResultHeader } from "./MaqlResultHeader.js";

export const MaqlResultTableArea = "maql_result_table";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    headerHolder: {
        flex: "0 0 auto",
        display: "flex",
        height: 36,
    },
    contentHolder: {
        flex: "1 1 auto",
        display: "flex",
        position: "relative",
        minHeight: 40,
    },
    loading: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: "-16px",
        marginTop: "-16px",
    },

    computing: {
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginLeft: 60,
        fontSize: "14px",
        color: theme.globals.colors.defaultStateBlank,

        ".gd-loading-spinner": {
            position: "absolute",
            left: -40,
            top: 0,
            bottom: 0,
            scale: "0.75",
        },
    },

    error: {
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginLeft: 60,
        fontSize: "14px",
        color: theme.globals.colors.defaultStateBlank,

        "div.icon": {
            position: "absolute",
            top: 0,
            left: "-40px",
            bottom: 0,
            fontSize: "32px",
            lineHeight: "32px",
        },
    },

    //pivot table
    table: {
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 200,

        ".gd-table-component .ag-root-wrapper": {
            backgroundColor: "transparent",
        },
        ".gd-table-component .ag-row": {
            backgroundColor: "transparent",
        },
        ".gd-table-component .ag-header": {
            backgroundColor: "transparent",
        },
        ".gd-table-component .gd-table-loading": {
            backgroundColor: "transparent",
        },
        ".gd-table-component .gd-table .gd-column-index-0, .gd-table-component .gd-table .gd-column-group-header--first":
            {
                paddingLeft: 20,
            },
        ".gd-table-component .gd-table .ag-header-row .ag-header-cell:last-child, .gd-table-component .gd-table .ag-row .ag-cell:last-child":
            {
                paddingRight: 20,
            },
    },

    //headline
    headline: {
        display: "flex",
        alignItems: "center",

        ".headline": {
            display: "flex",
            gap: 5,
            margin: "-10px 20px 0 20px",
            lineHeight: "14px",
        },
        ".headline:before": {
            content: '" = "',
        },
    },
}));

export interface IMaqlResultProps {
    execute: ReturnType<typeof useExecute>;
    attributes?: Array<ICatalogAttribute>;
    catalog?: { available: ICatalogAttribute[]; all: ICatalogAttribute[] };
    catalogLoading?: boolean;
    onContext?: (attrs: Array<ICatalogAttribute>) => void;
    onContextOpen?: () => void;
    display?: IMeasureSetting["display"];
    onDisplay?: (display: IMeasureSetting["display"]) => void;
}

export function MaqlResult({
    attributes = [],
    execute,
    catalog,
    catalogLoading,
    onContextOpen,
    onContext,
    display,
    onDisplay,
}: IMaqlResultProps) {
    const { classes, cx } = useStyles();
    const intl = useIntl();

    return (
        <div className={cx(classes.root)}>
            <div className={cx(classes.headerHolder)}>
                <MaqlResultHeader
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    display={display}
                    attributes={attributes}
                    onAction={(action, { selected, limit, ranking }) => {
                        switch (action) {
                            case HeaderAction.Context:
                                if (onContext) {
                                    onContext(selected || []);
                                }
                                break;
                            case HeaderAction.OpenContext:
                                if (onContextOpen) {
                                    onContextOpen();
                                }
                                break;
                            case HeaderAction.Display:
                                if (onDisplay) {
                                    onDisplay({ limit: limit || 10, ranking: ranking || "top" });
                                }
                                break;
                        }
                    }}
                />
            </div>
            <div className={cx(classes.contentHolder)}>
                {execute && (
                    <>
                        {attributes.length > 0 && (
                            <div className={cx(classes.table)} data-area={MaqlResultTableArea}>
                                <PivotTable
                                    {...execute}
                                    config={{
                                        columnSizing: {
                                            defaultWidth: "viewport",
                                            growToFit: true,
                                        },
                                    }}
                                    LoadingComponent={() => (
                                        <LoadingSpinner className={cx(classes.loading, "large")} />
                                    )}
                                    ErrorComponent={() => (
                                        <ErrorComponent
                                            message={intl.formatMessage({
                                                id: "metricComponent.editMetric.metric.result.error.title",
                                            })}
                                            description={intl.formatMessage({
                                                id: "metricComponent.editMetric.metric.result.error",
                                            })}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {attributes.length === 0 && (
                            <div className={cx(classes.headline)}>
                                <Headline
                                    primaryMeasure={execute.measures[0]}
                                    LoadingComponent={() => (
                                        <div className={cx(classes.computing)}>
                                            <LoadingSpinner className="large" />
                                            <div>
                                                {intl.formatMessage({
                                                    id: "metricComponent.editMetric.metric.result.computing",
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    ErrorComponent={() => (
                                        <div className={cx(classes.error)}>
                                            <div className="icon gd-icon-warning" />
                                            <div>
                                                {intl.formatMessage({
                                                    id: "metricComponent.editMetric.metric.result.error",
                                                })}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
