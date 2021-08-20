// (C) 2019-2021 GoodData Corporation
export const DOWNLOADER_ID = "downloader";

export function downloadFile(uri: string): void {
    const anchor = document.createElement("a");
    anchor.id = DOWNLOADER_ID;
    anchor.href = uri;
    anchor.download = uri;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
