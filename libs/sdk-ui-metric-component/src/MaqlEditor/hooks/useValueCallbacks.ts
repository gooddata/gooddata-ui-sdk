// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IStandaloneCodeEditor, type Monaco } from "../monaco/MonacoEditor.js";

export function useValueCallbacks(): {
    getValid: (editor: IStandaloneCodeEditor, monaco: Monaco) => boolean;
    getValue: (editor: IStandaloneCodeEditor) => string;
} {
    const getValue = useCallback((editor: IStandaloneCodeEditor) => editor.getValue(), []);

    const getValid = useCallback((editor: IStandaloneCodeEditor, monaco: Monaco) => {
        const model = editor.getModel();
        const markers = monaco.editor.getModelMarkers({ owner: "default", resource: model?.uri });
        return markers.filter((marker) => marker.severity === monaco.MarkerSeverity.Error).length === 0;
    }, []);

    return {
        getValid,
        getValue,
    };
}
