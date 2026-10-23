// (C) 2021-2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { IconCopy } from "@gooddata/sdk-ui-kit";

import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";
import { PartHeader } from "../PartHeader/PartHeader.js";
import { PartHeaderButton } from "../PartHeader/PartHeaderButton.js";

const useStyles = makeStyles()((theme: DefaultTheme) => {
    return {
        close: {
            marginRight: "-15px",

            ".gd-button-icon": {
                fontSize: "14px",
            },
        },
        copy: {
            "&.disabled": {
                opacity: 0.5,
            },
            "&:hover:not(.disabled) svg path": {
                fill: theme.globals.colors.active,
            },
        },
    };
});

export enum HeaderAction {
    Close = "close",
    Copy = "copy",
}

export interface IMaqlSqlHeader {
    canCopy?: boolean;
    onAction?: (action: HeaderAction) => void;
}

const messages = defineMessages({
    close: {
        id: "metricComponent.editMetric.metric.sql.close",
    },
    copy: {
        id: "metricComponent.editMetric.metric.sql.copy_to_clipboard",
    },
});

export function MaqlSqlHeader({ canCopy, onAction }: IMaqlSqlHeader) {
    const intl = useIntl();
    const { classes } = useStyles();

    return (
        <PartHeader
            className="s-maql_sql_header"
            TitleContent={<FormattedMessage id="metricComponent.editMetric.metric.sql" />}
            TitleTooltip={<FormattedMessage id="metricComponent.editMetric.metric.sql.tooltip" />}
            buttons={[
                <PartHeaderButton
                    key={0}
                    onClick={() => onAction?.(HeaderAction.Copy)}
                    tooltip={intl.formatMessage(messages.copy)}
                    disabled={!canCopy}
                    elementIconLeft={<IconCopy width={14} height={15} />}
                    sClassName="s-copy_to_clipboard_button"
                    className={classes.copy}
                />,
                <PartHeaderButton
                    key={1}
                    onClick={() => onAction?.(HeaderAction.Close)}
                    tooltip={intl.formatMessage(messages.close)}
                    iconLeft="gd-icon-cross"
                    sClassName="s-close_button"
                    className={classes.close}
                />,
            ]}
        />
    );
}
