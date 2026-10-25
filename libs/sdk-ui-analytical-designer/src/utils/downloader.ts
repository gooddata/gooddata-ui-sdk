// (C) 2007-2026 GoodData Corporation

import { type IExportResult } from "@gooddata/sdk-backend-spi";

const DOWNLOADER_ID = "downloader";

export function downloadFile({ objectUrl, fileName }: IExportResult) {
    const anchor = document.createElement("a");
    anchor.id = DOWNLOADER_ID;
    anchor.href = objectUrl;
    anchor.download = fileName ?? "exportedFile";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl); // release blob memory from window object
}
