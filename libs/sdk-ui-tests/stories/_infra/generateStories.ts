// (C) 2025 GoodData Corporation

type NamedImport = string | { name: string; alias: string };

interface Import {
    source: string;
    namedImports?: NamedImport[];
    defaultImport?: string;
}

export const header = `// (C) ${new Date().getFullYear()} GoodData Corporation`;

export function generateImports(imports: Import[]): string {
    return imports
        .map((i) => {
            const { source, namedImports, defaultImport } = i;

            let string = "import ";

            if (defaultImport) {
                if (namedImports?.length) {
                    string += `${defaultImport}, `;
                } else {
                    string += defaultImport;
                }
            }

            if (namedImports?.length) {
                string +=
                    "{ " +
                    namedImports
                        .map((i) => (typeof i === "string" ? i : `${i.name} as ${i.alias}`))
                        .join(", ") +
                    " }";
            }

            if (defaultImport || namedImports?.length) {
                return `${string} from "${source}";`;
            } else {
                return `${string}"${source}";`;
            }
        })
        .join("\n");
}

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
}

export function generateExportName(str: string): string {
    // Convert to TitleCase and remove invalid characters
    let name = toTitleCase(str.replaceAll(/[-/]/g, " ").replaceAll(/\s+/g, " ")).replaceAll(/[ :,%'()]/g, "");

    // If the first character is a number, prefix with $
    if (/^\d/.test(name)) name = `$${name}`;

    return name;
}
