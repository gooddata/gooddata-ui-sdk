// (C) 2019-2025 GoodData Corporation

import { AxiosResponse } from "axios";
import { mimeWordDecode } from "emailjs-mime-codec";

export function downloadFile(fileName: string, data: any) {
    const url = new Blob([data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

export const parseNameFromContentDisposition = (response: Pick<AxiosResponse, "headers">) => {
    const contentDispositionHeader = response.headers["content-disposition"];
    // eslint-disable-next-line regexp/no-unused-capturing-group
    const matches = /filename\*?=(?:UTF-8''([^;]+)|"([^"]+)")/.exec(contentDispositionHeader);
    const urlEncodedFileName = matches ? matches[2] : undefined;
    if (!urlEncodedFileName) {
        return undefined;
    }

    const decoded = mimeWordDecode(urlEncodedFileName);
    if (!decoded) {
        return undefined;
    }

    try {
        return decodeURIComponent(decoded);
    } catch {
        return decoded;
    }
};
