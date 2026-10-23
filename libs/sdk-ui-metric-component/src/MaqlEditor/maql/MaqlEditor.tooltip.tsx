// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { FormattedMessage, IntlProvider, type IntlShape } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ObjectContent } from "@gooddata/sdk-maql-language-server";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type IRootRef, destroyTooltip, renderTooltip } from "../components/ExpandableTooltip.js";
import { useExpandableTooltip } from "../components/hooks/useExpandableTooltip.js";
import { useCodeTheme } from "../hooks/useCodeTheme.js";
import {
    type IStandaloneEditorConstructionOptions,
    MainClassContent,
    MonacoEditor,
} from "../monaco/MonacoEditor.js";
import { makeStyles } from "../theme/styles.js";

import { LANGUAGE } from "./constants.js";
import { useDecoration } from "./hooks/useDecoration.js";
import { useLanguageService } from "./hooks/useLanguageService.js";
import { MaqlTooltip, MaqlTooltipEditorClass, TooltipMaqlStyles } from "./MaqlEditor.styles.js";

const BiggerClass = "bigger";
const SmallerClass = "smaller";
const ExpandedClass = "expanded";

const useStyles = makeStyles()((theme) => {
    const { title, description, colors, lineHeight, padding, readMore, space, tooltip } = theme.hoverMetric;
    const { borders } = theme.tooltip;

    const titleHeight = lineHeight + padding;
    const descriptionHeightNormal = lineHeight * 2;
    const descriptionHeightBigger = lineHeight * 4;

    const expandIcon = 15;
    const size = tooltip.normal.maxHeight - titleHeight - title.bottomSpace - space - borders.size;
    const normalSize = size - descriptionHeightNormal;
    const smallerSize = size - descriptionHeightBigger;

    const link = {
        color: colors.link,
        textDecoration: "underline",
        cursor: "pointer",
    };

    return {
        content: {
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
        },
        title: {
            margin: 0,
            fontWeight: "normal",
            padding: `${padding}px ${padding + expandIcon}px 0 ${padding}px`,
            lineHeight: `${lineHeight}px`,
            fontSize: `${title.fontSize}px`,
            marginBottom: `${title.bottomSpace}px`,
            maxHeight: `${titleHeight}px`,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            width: `calc(100% - ${padding * 2 + expandIcon}px)`,

            [`&.${BiggerClass}`]: {
                position: "absolute",
                width: `calc(100% - ${padding * 3 + expandIcon}px)`,
                background: "white",
                zIndex: 1,
            },

            [`&.${ExpandedClass}`]: {
                position: "absolute",
                background: "white",
                zIndex: 1,
            },
        },
        description: {
            position: "relative",
            overflow: "hidden",
            fontSize: `${description.fontSize}px`,
            lineHeight: `${lineHeight}px`,
            padding: `0 ${padding}px 0px ${padding}px`,
            marginBottom: `${space}px`,
            color: colors.color,
            maxHeight: `${descriptionHeightNormal}px`,

            [`&.${BiggerClass}`]: {
                padding: `${titleHeight + title.bottomSpace}px ${padding}px ${space}px ${padding}px`,
                marginBottom: 0,
                maxHeight: `${descriptionHeightBigger}px`,
                overflow: "auto",
            },

            [`&.${ExpandedClass}`]: {
                padding: `${titleHeight + title.bottomSpace}px ${padding}px ${space}px ${padding}px`,
                marginBottom: 0,
                maxHeight: `${tooltip.expanded.maxHeightDescription}px !important`,
                overflow: "hidden",
            },
        },
        readMore: {
            bottom: 0,
            position: "absolute",
            right: `${padding}px`,
            background: theme.tooltip.colors.background,

            span: {
                padding: `0 ${readMore.paddingText}px 0 0`,
                color: colors.color,
            },

            a: link,
        },
        readLess: {
            padding: `0 0 0 ${readMore.paddingText}px`,
            a: link,
        },
        hr: {
            width: "100%",
            height: 0,
            margin: 0,
            borderTop: borders.default,
        },
        maql: {
            [`.${MainClassContent}`]: {
                minWidth: "100%",
                maxWidth: "100%",
                minHeight: `0 !important`,
                maxHeight: `${normalSize}px !important`,

                ".lines-content": {
                    paddingLeft: `${padding}px !important`,
                },
                textarea: {
                    marginLeft: `${padding + 1}px !important`,
                },
            },

            [`&.${SmallerClass}`]: {
                [`.${MainClassContent}`]: {
                    maxHeight: `${smallerSize}px !important`,
                },
            },

            [`&.${ExpandedClass}`]: {
                [`.${MainClassContent}`]: {
                    maxHeight: `${
                        tooltip.expanded.maxHeight - tooltip.expanded.maxHeightDescription
                    }px !important`,
                },
            },
        },
    };
});

export interface IMaqlEditorTooltipProps {
    content: ObjectContent;
    backend: IAnalyticalBackend;
    workspaceId: string;
    intl: IntlShape;
}

function MaqlEditorTooltip({ content, intl, backend, workspaceId }: IMaqlEditorTooltipProps) {
    return (
        <IntlProvider
            locale={intl ? intl.locale : "en-US"}
            defaultLocale={intl ? intl.locale : "en-US"}
            messages={intl ? intl.messages : {}}
        >
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspaceId}>
                    <MaqlEditorTooltipContent content={content} />
                </WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>
    );
}

export interface IMaqlEditorTooltipContentProps {
    content: ObjectContent;
}

function MaqlEditorTooltipContent({ content }: IMaqlEditorTooltipContentProps) {
    const { classes, cx } = useStyles();
    const { title, description, maql } = content;

    const ls = useLanguageService();
    const decoration = useDecoration(ls, true);

    const [theme, themeData] = useCodeTheme();
    const options = useEditorOptions();

    const { expanded, setHasScrollbar } = useExpandableTooltip();

    const [descriptionOpened, setDescriptionOpened] = useState<boolean>(false);
    const [readMore, setReadMore] = useState<boolean>(false);
    const descElementRef = useRef<HTMLDivElement>(null);
    const descElement = descElementRef.current;

    useEffect(
        () => setReadMore(Boolean(descElement && descElement.scrollHeight > descElement.offsetHeight)),
        [descElement],
    );

    return (
        <>
            <div className={classes.content}>
                <h2
                    className={cx(classes.title, descriptionOpened && BiggerClass, expanded && ExpandedClass)}
                >
                    {title}
                </h2>
                {!expanded && (
                    <div
                        className={cx(classes.description, descriptionOpened && BiggerClass)}
                        ref={descElementRef}
                    >
                        {description}
                        {readMore && !descriptionOpened && (
                            <div className={classes.readMore}>
                                <span>…</span>
                                <a
                                    onClick={() => {
                                        setDescriptionOpened(true);
                                        setHasScrollbar(true);
                                    }}
                                >
                                    <FormattedMessage id="metricComponent.editMetric.hover.more" />
                                </a>
                            </div>
                        )}
                        {readMore && descriptionOpened && (
                            <span className={classes.readLess}>
                                <a
                                    onClick={() => {
                                        setDescriptionOpened(false);
                                        setHasScrollbar(false);
                                        if (descElement) {
                                            descElement.scrollTop = 0;
                                        }
                                    }}
                                >
                                    <FormattedMessage id="metricComponent.editMetric.hover.less" />
                                </a>
                            </span>
                        )}
                    </div>
                )}
                {expanded && <div className={cx(classes.description, ExpandedClass)}>{description}</div>}
                <div className={classes.hr} />
                <div
                    className={cx(classes.maql, descriptionOpened && SmallerClass, expanded && ExpandedClass)}
                >
                    <MonacoEditor
                        className={MaqlTooltipEditorClass}
                        inline
                        options={options}
                        readonly
                        autofocus={false}
                        defaultValue={maql}
                        language={LANGUAGE}
                        themeName={theme}
                        themeData={themeData}
                        onEditorMount={(editor) => decoration(editor)}
                    />
                </div>
            </div>
        </>
    );
}

export type MaqlTooltipSettings = {
    content: ObjectContent;
    workspaceId: string;
    elements: Array<HTMLElement>;
    /**
     * Stable owner of the tooltip for outside-click attribution — the editor's container node.
     * See IExpandableTooltipSettings.anchor.
     */
    anchor?: HTMLElement;
    backend: IAnalyticalBackend;
    intl: IntlShape;
    readOnly?: boolean;
    cachedPositions?: Array<
        | {
              top: number;
              left: number;
              width: number;
              height: number;
          }
        | undefined
    >;
};
export function renderMaqlTooltip(
    ref: MutableRefObject<IRootRef | null>,
    { content, backend, workspaceId, intl, elements, anchor, readOnly, cachedPositions }: MaqlTooltipSettings,
    onOpen?: () => void,
    onDestroy?: () => void,
): void {
    if (!content) {
        return;
    }

    // Validate elements
    if (!elements || elements.length === 0) {
        return;
    }

    renderTooltip(
        ref,
        {
            elements,
            anchor,
            className: classNames("s_maql_tooltip", MaqlTooltip),
            readOnly,
            onOpen,
            onDestroy,
            cachedPositions,
        },
        <>
            <TooltipMaqlStyles />
            <MaqlEditorTooltip content={content} backend={backend} workspaceId={workspaceId} intl={intl} />
        </>,
    );
}

export function destroyMaqlTooltip(ref: MutableRefObject<IRootRef | null>): void {
    destroyTooltip(ref);
}

function useEditorOptions() {
    return useMemo(
        () =>
            ({
                lineNumbers: "off",
                lineNumbersMinChars: 0,
                folding: false,
            }) as Partial<IStandaloneEditorConstructionOptions>,
        [],
    );
}
