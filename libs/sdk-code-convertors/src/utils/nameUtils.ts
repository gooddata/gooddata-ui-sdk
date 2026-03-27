// (C) 2023-2026 GoodData Corporation

import { type FilePath, convertIdOrTitleToId, convertTitleToId, parsePath } from "./sharedUtils.js";

const EXTENSIONS = /\.yaml$/;
const LENGTH = 50;

export type FileNamesUsed = {
    files: string[];
};

export function generateFileName(
    used: FileNamesUsed,
    base: string[],
    id: string,
    title?: string | null,
): string {
    const fileName = normalizeFilenameLength(convertIdOrTitleToId(id, title));

    let count = 0;
    let file = generateFilePath(base, fileName);
    while (used.files.includes(file.toLowerCase())) {
        count++;
        file = generateFilePath(base, fileName, count);
    }

    used.files.push(file.toLowerCase());
    return file;
}

export function resolveIdFromFileName(fileName: FilePath): string {
    const path = parsePath(fileName);
    const name = path[path.length - 1];

    return convertTitleToId(name.replace(EXTENSIONS, ""));
}

function generateFilePath(base: string[], filename: string, index = 0): string {
    return [...base, `${filename}${index || ""}.yaml`].join("/");
}

function normalizeFilenameLength(filename: string) {
    if (filename.length <= LENGTH) {
        return filename;
    }

    const parts = filename.split("_");

    while (parts.length > 1 && parts.join("_").length > LENGTH) {
        parts.pop();
    }
    if (parts.length === 1 && parts.join("_").length > LENGTH) {
        return filename.slice(0, LENGTH);
    }

    return parts.join("_");
}
