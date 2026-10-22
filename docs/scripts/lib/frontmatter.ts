import { parse as parseYaml } from "yaml";

/** Split a markdown document into its YAML frontmatter and body. */
export function parseFrontmatter(markdown: string): {
    frontmatter: Record<string, unknown>;
    body: string;
} {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: markdown };
    return {
        frontmatter: (parseYaml(match[1]) as Record<string, unknown>) ?? {},
        body: match[2],
    };
}
