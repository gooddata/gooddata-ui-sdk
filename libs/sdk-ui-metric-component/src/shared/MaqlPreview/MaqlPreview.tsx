// (C) 2021-2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { type ObjRef } from "@gooddata/sdk-model";

import { makeStyles } from "../theme/index.js";

import { type IExpressionToken } from "./backend/measureExpressionTokens.js";
import { useMetricTokens } from "./hooks/useMetricTokens.js";

const useStyles = makeStyles()((theme) => ({
    fact: {
        color: `${theme.globals.colors.fact} !important`,
        fontWeight: "bold",
    },
    metric: {
        color: `${theme.globals.colors.metric} !important`,
        fontWeight: "bold !important",
    },
    attribute: {
        color: `${theme.globals.colors.attribute} !important`,
        fontWeight: "bold",
    },
    dataset: {
        color: `${theme.globals.colors.dataset} !important`,
        fontWeight: "bold",
    },
    parameter: {
        color: `${theme.globals.colors.parameter} !important`,
        fontWeight: "bold",
    },
    keyword: {
        color: `${theme.globals.colors.maqlKeyword} !important`,
        fontWeight: "normal",
    },
    value: {
        color: `${theme.globals.colors.value} !important`,
        fontWeight: "normal",
    },
    bracket: {
        color: `black !important`,
        fontWeight: "normal",
    },
    comment: {
        color: `${theme.globals.colors.comment} !important`,
        fontWeight: "normal",
        fontStyle: "normal",
        display: "none",
    },
}));

export interface IMaqlPreviewProps {
    metricRef: ObjRef;
    expressionFallback: string;
    maqlFragmentCommonProps: IMaqlFragmentCommonProps;
}

export function MaqlPreview({ metricRef, expressionFallback, maqlFragmentCommonProps }: IMaqlPreviewProps) {
    const { loading, result } = useMetricTokens(metricRef, expressionFallback);

    if (loading) {
        return <FormattedMessage id="loading" />;
    }

    return <MaqlPreviewRenderer tokens={result} maqlFragmentCommonProps={maqlFragmentCommonProps} />;
}

export interface IMaqlPreviewRendererProps {
    tokens: IExpressionToken[];
    maqlFragmentCommonProps: IMaqlFragmentCommonProps;
}

export function MaqlPreviewRenderer({ tokens, maqlFragmentCommonProps }: IMaqlPreviewRendererProps) {
    const intl = useIntl();
    const { classes } = useStyles();

    return (
        <div>
            {tokens.map((expression: IExpressionToken, idx) => {
                return (
                    <MaqlFragment
                        key={idx}
                        classes={classes}
                        expression={expression}
                        {...maqlFragmentCommonProps}
                    >
                        {getTitle(expression, intl)}
                    </MaqlFragment>
                );
            })}
        </div>
    );
}

export interface IMaqlFragmentCommonProps {
    links?: NonNullable<IExpressionToken["category"]>[];
    onClick?: (token: IExpressionToken) => void;
    getLink?: (token: IExpressionToken) => string;
}

function MaqlFragment({
    expression,
    classes,
    links = [],
    onClick,
    getLink,
    children,
}: PropsWithChildren<
    {
        expression: IExpressionToken;
        classes: ReturnType<typeof useStyles>["classes"];
    } & IMaqlFragmentCommonProps
>) {
    const { category } = expression;
    if (category && links.indexOf(category) >= 0) {
        return (
            <a
                target="_blank"
                rel="noreferrer"
                className={getClassName(classes, category)}
                href={getLink?.(expression)}
                onClick={() => onClick?.(expression)}
            >
                {children}
            </a>
        );
    }
    return (
        <span className={getClassName(classes, category)} onClick={() => onClick?.(expression)}>
            {children}
        </span>
    );
}

function getClassName(classes: ReturnType<typeof useStyles>["classes"], category: string | undefined) {
    switch (category) {
        case "fact": {
            return classes.fact;
        }
        case "attribute": {
            return classes.attribute;
        }
        case "dataSet": {
            return classes.dataset;
        }
        case "comment": {
            return classes.comment;
        }
        case "number":
        case "quoted_text": {
            return classes.value;
        }
        case "bracket": {
            return classes.bracket;
        }
        case "measure":
        case "metric": {
            return classes.metric;
        }
        case "parameter": {
            return classes.parameter;
        }
        default: {
            return classes.keyword;
        }
    }
}

function getTitle(expression: IExpressionToken, intl: IntlShape) {
    if (expression.deleted) {
        return `(${intl.formatMessage({ id: "metricList.tooltip.deleted_value" })})`;
    }
    if (expression.empty) {
        return `(${intl.formatMessage({ id: "metricList.tooltip.empty_value" })})`;
    }
    return expression.title;
}
