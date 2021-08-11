// (C) 2019-2021 GoodData Corporation

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
