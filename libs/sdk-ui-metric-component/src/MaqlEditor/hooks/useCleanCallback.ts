// (C) 2021-2026 GoodData Corporation

import { type MutableRefObject, useEffect } from "react";

import { type IDisposable } from "../monaco/MonacoEditor.js";

export function useCleanCallback(...disposables: MutableRefObject<IDisposable[]>[]): void {
    useEffect(() => {
        return () => {
            disposables.forEach((dis) => {
                dis.current.forEach((item) => item.dispose());
            });
        };
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
