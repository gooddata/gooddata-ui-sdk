// (C) 2021-2026 GoodData Corporation

import { Fragment } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type ICatalogAttribute } from "@gooddata/sdk-model";

import { makeStyles } from "../../../shared/theme/index.js";
import { type IMeasureSetting } from "../../metric/metricHelpers.js";
import { PartDivider, PartHeader } from "../PartHeader/PartHeader.js";
import { PartHeaderButton } from "../PartHeader/PartHeaderButton.js";

import { AttributesSelect } from "./components/AttributesSelect.js";
import { LimitSelect } from "./components/LimitSelect.js";

export enum HeaderAction {
    Context = "context",
    Display = "display",
    OpenContext = "open-context",
}

export interface IMaqlResultHeader {
    catalog?: { available: ICatalogAttribute[]; all: ICatalogAttribute[] };
    catalogLoading?: boolean;
    attributes?: Array<ICatalogAttribute>;
    display?: IMeasureSetting["display"];
    onAction?: (
        action: HeaderAction,
        opts: {
            selected?: Array<ICatalogAttribute>;
            limit?: IMeasureSetting["display"]["limit"];
            ranking?: IMeasureSetting["display"]["ranking"];
        },
    ) => void;
}

const useStyles = makeStyles()(() => ({
    limit: {
        marginRight: "-15px",

        ".gd-button-text": {
            fontSize: "12px",
            textDecoration: "none !important",

            "&:hover": {
                textDecoration: "underline !important",
            },
        },
    },
}));

const messages = defineMessages({
    context: {
        id: "metricComponent.editMetric.metric.result.context",
    },

    display: {
        id: "metricComponent.editMetric.metric.result.context.display",
    },
    displayTop: {
        id: "metricComponent.editMetric.metric.result.context.displayTop",
    },
    displayBottom: {
        id: "metricComponent.editMetric.metric.result.context.displayBottom",
    },
});

export function MaqlResultHeader({
    display = { limit: 10, ranking: "top" },
    catalog = { available: [], all: [] },
    catalogLoading,
    attributes = [],
    onAction,
}: IMaqlResultHeader) {
    const { classes } = useStyles();
    const intl = useIntl();

    return (
        <PartHeader
            className="s-maql_result_header"
            TitleContent={<FormattedMessage id="metricComponent.editMetric.metric.result" />}
            TitleTooltip={<FormattedMessage id="metricComponent.editMetric.metric.result.tooltip" />}
            buttons={[
                <AttributesSelect
                    key={0}
                    loading={catalogLoading}
                    all={catalog.all}
                    attributes={catalog.available}
                    preselected={attributes}
                    opener={({ openDropdown }) => (
                        <PartHeaderButton
                            key={0}
                            value={intl.formatMessage(messages.context)}
                            iconLeft={attributes.length > 0 ? "gd-icon-pencil" : "gd-icon-add"}
                            onClick={openDropdown}
                            sClassName="s-context-button"
                        />
                    )}
                    onOpen={() => onAction?.(HeaderAction.OpenContext, {})}
                    onApply={(selected) => onAction?.(HeaderAction.Context, { selected })}
                />,
                attributes?.length > 0 && (
                    <Fragment key={1}>
                        <PartDivider />
                        <LimitSelect
                            limit={display.limit}
                            ranking={display.ranking}
                            opener={({ openDropdown, isOpen }) => (
                                <PartHeaderButton
                                    iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
                                    value={intl.formatMessage(messages.display, {
                                        ranking:
                                            display.ranking === "top"
                                                ? intl.formatMessage(messages.displayTop)
                                                : intl.formatMessage(messages.displayBottom),
                                        limit: display.limit,
                                    })}
                                    onClick={openDropdown}
                                    sClassName="s-display-button"
                                    className={classes.limit}
                                />
                            )}
                            onApply={(limit, ranking) => onAction?.(HeaderAction.Display, { limit, ranking })}
                            onCancel={() => null}
                        />
                    </Fragment>
                ),
            ]}
        />
    );
}
