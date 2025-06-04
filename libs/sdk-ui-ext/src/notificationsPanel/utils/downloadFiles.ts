// (C) 2024-2025 GoodData Corporation

/**
 * Downloads multiple files by triggering browser downloads.
 * @param files - Array of objects with url and optional fileName.
 *
 * @internal
 */
export async function downloadFiles(files: Array<{ url: string; fileName?: string }>): Promise<void> {
    for (const file of files) {
        if (file.url) {
            const a = document.createElement("a");
            a.href = file.url;
            a.download = file.fileName || "export";
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // so browser doesn't block the next download
        }
    }
}
