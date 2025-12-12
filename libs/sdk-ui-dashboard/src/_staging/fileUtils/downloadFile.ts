// (C) 2019-2023 GoodData Corporation
import { type IExportResult } from "@gooddata/sdk-backend-spi";

export const DOWNLOADER_ID = "downloader";

export function downloadFile({ objectUrl, fileName }: IExportResult): void {
    const anchor = document.createElement("a");
    anchor.id = DOWNLOADER_ID;
    anchor.href = objectUrl;
    anchor.download = fileName ?? "exportedFile";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (objectUrl) {
        URL.revokeObjectURL(objectUrl); // release blob memory from window object
    }
}
