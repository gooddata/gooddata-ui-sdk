// (C) 2024-2026 GoodData Corporation

import Markdown, { type Components } from "react-markdown";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import { Typography } from "@gooddata/sdk-ui-kit";

import { CustomHyperlink } from "./CustomHyperlink.js";
import { type TextContentObject } from "../../../model.js";
import { rehypeReferences } from "../../completion/plugins/rehype-references.js";
import { remarkReferences } from "../../completion/plugins/remark-references.js";

const componentMap: Components = {
    p: ({ children }) => <Typography tagName="p">{children}</Typography>,
    a: ({ children, href }) => <CustomHyperlink href={href ?? ""} text={children as string} />,
    h1: ({ children }) => <Typography tagName="h1">{children}</Typography>,
    h2: ({ children }) => <Typography tagName="h2">{children}</Typography>,
    h3: ({ children }) => <Typography tagName="h3">{children}</Typography>,
};

/**
 * Allow custom gooddata:// URL Schema
 */
const customUrlTransform = (url: string): string => {
    return /^http|https|mailto|tel|gooddata:/i.test(url) ? url : "";
};

type MarkdownComponentProps = {
    children: string;
    allowMarkdown?: boolean;
    references?: TextContentObject[];
    onLinkClick?: (url: string) => void;
};

export function MarkdownComponent({ children, references, allowMarkdown = false }: MarkdownComponentProps) {
    if (allowMarkdown) {
        return (
            <Markdown
                remarkPlugins={[remarkEmoji, remarkGfm, remarkReferences()]}
                rehypePlugins={[rehypeReferences(references ?? [])]}
                components={componentMap}
                urlTransform={customUrlTransform}
            >
                {children}
            </Markdown>
        );
    }

    return <Typography tagName="p">{children}</Typography>;
}
