// (C) 2021-2026 GoodData Corporation

import { useEffect, useMemo, useRef } from "react";

import * as monaco from "monaco-editor/editor/editor.api.js";
import { useIntl } from "react-intl";
import { type InitializeResult } from "vscode-languageserver";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";
import { type IMetadataObject } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
//more info in README.md

import { type IRootRef } from "../../components/ExpandableTooltip.js";
import { type IStandaloneCodeEditor } from "../../monaco/MonacoEditor.js";
import { destroyMaqlTooltip } from "../MaqlEditor.tooltip.js";
import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from "../monacoConverter.js";
import { createDocument } from "../utils.js";

import { doHover } from "./hover/doHover.js";
import { useHoverEvent } from "./hover/useHoverEvent.js";

export function useHover(
    editor: IStandaloneCodeEditor | null,
    languageId: string,
    languageService: MaqlLanguageService | undefined,
    initializeData: InitializeResult | undefined,
    onOpen?: (editor: IStandaloneCodeEditor, object: IMetadataObject) => void,
): void {
    const tooltip = useRef<IRootRef | null>(null);
    const [isHoverShortcut, shortcut] = useHoverShortcut();
    const currentEvent = useHoverEvent(editor?.getContainerDomNode() ?? null, tooltip, isHoverShortcut);

    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const intl = useIntl();

    useEffect(() => {
        if (!isReady(editor, languageService, initializeData)) {
            return;
        }

        editor.addCommand(shortcut, () => {
            editor.trigger("", "editor.action.showHover", "");
        });

        const m2p = new MonacoToProtocolConverter(monaco);
        const p2m = new ProtocolToMonacoConverter(monaco);

        const disposeHover = monaco.languages.registerHoverProvider(languageId, {
            provideHover: (model, position) => {
                const document = createDocument(model);
                return languageService
                    ?.doHover(document, m2p.asPosition(position.lineNumber, position.column))
                    .then((hover) => {
                        const readOnly = Boolean(editor.getRawOptions().readOnly || hover?.object?.isLocked);
                        const monacoHover = p2m.asHover(hover) || null;
                        const settings = {
                            backend,
                            workspaceId,
                            intl,
                            content: hover?.object,
                            readOnly,
                        };

                        return doHover(currentEvent.current, tooltip, editor, monacoHover, settings, onOpen);
                    })
                    .catch((_error) => {
                        return null;
                    });
            },
        });

        return () => {
            disposeHover.dispose();
            destroyMaqlTooltip(tooltip);
        };
    }, [
        shortcut,
        editor,
        intl,
        languageId,
        languageService,
        initializeData,
        backend,
        workspaceId,
        currentEvent,
        onOpen,
    ]);
}

function isReady(
    editor: IStandaloneCodeEditor | null,
    languageService: MaqlLanguageService | undefined,
    initializeData: InitializeResult | undefined,
): editor is IStandaloneCodeEditor {
    return Boolean(editor && languageService && initializeData?.capabilities?.hoverProvider);
}

function useHoverShortcut(): [(e: KeyboardEvent) => boolean, number] {
    return useMemo(
        () => [
            (e: KeyboardEvent) => isCtrlOrCmd(e) && e.key === "u",
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU,
        ],
        [],
    );
}

function isCtrlOrCmd(e: KeyboardEvent) {
    return e.ctrlKey || e.metaKey;
}
