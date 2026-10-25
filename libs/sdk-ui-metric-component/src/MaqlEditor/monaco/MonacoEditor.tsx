// (C) 2021-2026 GoodData Corporation

import { type Ref, forwardRef, useCallback, useImperativeHandle, useState } from "react";

import classNames from "classnames";
import type * as monaco from "monaco-editor/editor/editor.api.js";

//more info in README.md
import { makeStyles } from "../theme/styles.js";

import { useAutofocus } from "./hooks/useAutofocus.js";
import { useMonaco } from "./hooks/useMonaco.js";
import { type IMaqlEditorIcons, MonacoStyles } from "./MonacoEditor.styles.js";

/**
 * @internal
 */
export type Monaco = typeof monaco;

export interface IMonacoEditorProps {
    inline?: boolean;
    readonly?: boolean;
    options?: Partial<IStandaloneEditorConstructionOptions>;
    icons?: IMaqlEditorIcons;
    autofocus?: boolean;
    className?: string;
    language?: string;
    languageConfiguration?: monaco.languages.LanguageConfiguration;
    defaultValue?: string;
    themeName?: string;
    themeData?: IStandaloneThemeData;
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onEditorUpdate?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
    onContentSizeChange?: (
        editor: IStandaloneCodeEditor,
        monaco: Monaco,
        width: number,
        height: number,
    ) => void;
    heightOffset?: number;
    ref?: Ref<IStandaloneCodeEditor | null>;
}

/**
 * @internal
 */
export type IDisposable = monaco.IDisposable;

/**
 * @internal
 */
export type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

/**
 * @internal
 */
export type IStandaloneEditorConstructionOptions = monaco.editor.IStandaloneEditorConstructionOptions;

/**
 * @internal
 */
export type IEditorContribution = monaco.editor.IEditorContribution;
export type IStandaloneThemeData = monaco.editor.IStandaloneThemeData;
export type IMarkerData = monaco.editor.IMarkerData;
export type IReadOnlyModel = monaco.editor.IReadOnlyModel;
export type FormattingOptions = monaco.languages.FormattingOptions;
export type Range = monaco.Range;
export type ISuggestContribution = IEditorContribution & {
    widget: {
        value: {
            onDidShow: (handler: () => void) => void;
            onDidHide: (handler: () => void) => void;
            element: {
                domNode: HTMLElement;
            };
        };
    };
};
export type IMarkersContribution = IEditorContribution & {
    close(focusEditor?: boolean): void;
};

const useStyles = makeStyles()(() => ({
    editor: {
        display: "flex",
        position: "relative",
        textAlign: "initial",
        width: "100%",
        height: "100%",
    },
    inline: {
        width: "100%",
        height: "100%",
    },
    content: {
        width: "100%",
    },
}));

export const MainClass = "maql-editor";
export const MainClassContent = "maql-editor-content";

export const MonacoEditor = forwardRef<IStandaloneCodeEditor | null, IMonacoEditorProps>(
    function MonacoEditor(
        {
            icons,
            options,
            autofocus = false,
            className = "",
            language = "",
            languageConfiguration,
            defaultValue = "",
            themeName = "",
            themeData,
            onEditorMount = () => {},
            onEditorUpdate = () => {},
            inline = false,
            readonly = false,
        },
        ref,
    ) {
        const [element, setElement] = useState<HTMLDivElement | null>(null);
        const [uniqueId] = useState(`${MainClassContent}-${Math.random().toString(36).slice(2)}`);
        const { width, height, onContentSizeChange } = useContentSize(inline);
        const editor = useMonaco(element, {
            className: [MainClass, className].join(" "),
            options,
            language,
            languageConfiguration,
            defaultValue,
            themeName,
            themeData,
            inline,
            readonly,
            onEditorMount,
            onEditorUpdate,
            onContentSizeChange,
        });

        useImperativeHandle<IStandaloneCodeEditor | null, IStandaloneCodeEditor | null>(ref, () => editor, [
            editor,
        ]);

        const { classes } = useStyles();

        useAutofocus(element, editor, autofocus || false);

        return (
            <section
                id={uniqueId}
                className={classNames(classes.editor, MainClassContent, inline && classes.inline)}
                style={getStyles(width, height, inline)}
            >
                <MonacoStyles id={uniqueId} icons={icons} themeData={themeData} options={options} />
                <div ref={(ref) => setElement(ref)} className={classes.content} />
            </section>
        );
    },
);

function useContentSize(inline: boolean) {
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);

    const onContentSizeChange = useCallback(
        // oxlint-disable-next-line @typescript-eslint/no-explicit-any
        (...[, , currentWidth, currentHeight]: any) => {
            if (inline) {
                setWidth(currentWidth);
                setHeight(currentHeight);
            }
        },
        [inline],
    );

    return { width, height, onContentSizeChange };
}

function getStyles(width: number, height: number, inline: boolean) {
    if (inline && width > 0 && height > 0) {
        return { height, width };
    }
    return {};
}
