// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useRef } from "react";

import { type IDisposable, type IStandaloneCodeEditor, type Monaco } from "../monaco/MonacoEditor.js";
// All monaco editor contributions, WITHOUT the ~80 basic languages and the css/html/json/TS
// language-feature services that `editor.main.js` would also drag in (~10 MB+). The MAQL editor
// registers its own "maql" language and tokens provider, so it needs no built-in language.
import "../monaco/monacoContributions.js";

export type UseMountHandlers = {
    onEditorMount?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
};

type UseMountCallbacks = {
    setCodeEditor?: (editor: IStandaloneCodeEditor) => void;
    afterStart?: (editor: IStandaloneCodeEditor, monaco: Monaco) => void;
};

export function useMountCallback(
    { setCodeEditor, afterStart }: UseMountCallbacks,
    { onEditorMount }: UseMountHandlers,
): [(editor: IStandaloneCodeEditor, monaco: Monaco) => void, MutableRefObject<IDisposable[]>] {
    const disposable = useRef<Array<IDisposable>>([]);

    const callback = useCallback(
        (editor: IStandaloneCodeEditor, monaco: Monaco) => {
            disposable.current.forEach((item) => item.dispose());
            disposable.current = [];
            if (onEditorMount) {
                onEditorMount(editor, monaco);
            }

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
                editor.trigger("", "editor.action.triggerSuggest", "");
            });

            if (afterStart) {
                afterStart(editor, monaco);
            }
            if (setCodeEditor) {
                setCodeEditor(editor);
            }
        },
        [disposable, onEditorMount, afterStart, setCodeEditor],
    );

    return [callback, disposable];
}
