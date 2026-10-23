// (C) 2021-2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { IconRun } from "@gooddata/sdk-ui-kit";

import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { useFeaturesAndSettings } from "../../FeaturesAndSettings/index.js";
import { PartHeader } from "../PartHeader/PartHeader.js";
import { PartHeaderButton } from "../PartHeader/PartHeaderButton.js";

export enum HeaderAction {
    Run = "run",
    SQL = "sql",
    Format = "format",
    Titles = "titles",
}

export interface IMaqlEditorHeader {
    isSQL?: boolean;
    areTitles?: boolean;
    isMaqlDefined?: boolean;
    onAction?: (action: HeaderAction) => void;
}

const useStyles = makeStyles()((theme: DefaultTheme) => {
    return {
        run: {
            "&.disabled svg path": {
                fill: theme.globals.colors.defaultBorderDarker,
            },
        },
    };
});

const messages = defineMessages({
    autoFormat: {
        id: "metricComponent.editMetric.autoFormat",
    },
    autoFormatBubble: {
        id: "metricComponent.editMetric.autoFormatBubble",
    },
    autoFormatBubbleMac: {
        id: "metricComponent.editMetric.autoFormatBubbleMac",
    },

    run: {
        id: "metricComponent.editMetric.run",
    },
    runBubble: {
        id: "metricComponent.editMetric.runBubble",
    },
    runBubbleMac: {
        id: "metricComponent.editMetric.runBubbleMac",
    },
    runBubbleDisabled: {
        id: "metricComponent.editMetric.runBubble.disabled",
    },

    sql: {
        id: "metricComponent.editMetric.sql",
    },
    sqlBubbleDisabled: {
        id: "metricComponent.editMetric.sql.disabled",
    },

    decoratorsShow: {
        id: "metricComponent.editMetric.decoratorsShow",
    },
    decoratorsHide: {
        id: "metricComponent.editMetric.decoratorsHide",
    },
});

export function MaqlEditorHeader({ areTitles, isMaqlDefined, isSQL, onAction }: IMaqlEditorHeader) {
    const intl = useIntl();
    const { classes } = useStyles();
    const { canShowResults, canShowSql } = useFeaturesAndSettings();

    return (
        <PartHeader
            className="s-maql_definition_header"
            TitleContent={<FormattedMessage id="metricComponent.editMetric.metric.definition" />}
            TitleTooltip={<FormattedMessage id="metricComponent.editMetric.metric.definition.tooltip" />}
            buttons={[
                canShowResults && (
                    <PartHeaderButton
                        key={0}
                        disabledTooltip={intl.formatMessage(messages.runBubbleDisabled)}
                        tooltip={intl.formatMessage(messages.runBubble)}
                        tooltipMac={intl.formatMessage(messages.runBubbleMac)}
                        value={intl.formatMessage(messages.run)}
                        elementIconLeft={<IconRun />}
                        disabled={!isMaqlDefined}
                        onClick={() => onAction?.(HeaderAction.Run)}
                        sClassName="s-run-button"
                        className={classes.run}
                    />
                ),
                canShowSql && !isSQL && (
                    <PartHeaderButton
                        key={1}
                        disabledTooltip={intl.formatMessage(messages.sqlBubbleDisabled)}
                        value={intl.formatMessage(messages.sql)}
                        disabled={!isMaqlDefined}
                        onClick={() => onAction?.(HeaderAction.SQL)}
                        sClassName="s-show-sql-button"
                    />
                ),
            ]}
            dropdown={[
                {
                    type: "link",
                    title: intl.formatMessage(messages.autoFormat),
                    tooltip: intl.formatMessage(messages.autoFormatBubble),
                    tooltipMac: intl.formatMessage(messages.autoFormatBubbleMac),
                    onClick: () => onAction?.(HeaderAction.Format),
                },
                { type: "separator" },
                {
                    type: "link",
                    title: areTitles
                        ? intl.formatMessage(messages.decoratorsHide)
                        : intl.formatMessage(messages.decoratorsShow),
                    onClick: () => onAction?.(HeaderAction.Titles),
                },
            ]}
        />
    );
}
