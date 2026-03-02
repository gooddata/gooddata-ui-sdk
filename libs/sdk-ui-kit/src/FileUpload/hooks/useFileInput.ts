// (C) 2026 GoodData Corporation

import { type ChangeEvent, useCallback, useRef } from "react";

/**
 * @internal
 */
export function useFileInput(onFilesSelected: (files: File[]) => void) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files ? Array.from(event.target.files) : [];
            if (files.length) {
                onFilesSelected(files);
            }

            event.target.value = "";
        },
        [onFilesSelected],
    );

    return { inputRef, handleInputChange };
}
