// (C) 2024-2025 GoodData Corporation

import React from "react";

import Markdown, { Components } from "react-markdown";
import remarkEmoji from "remark-emoji";

import { Typography } from "@gooddata/sdk-ui-kit";

import { CustomHyperlink } from "./CustomHyperlink.js";
import { TextContentObject } from "../../../model.js";
import { rehypeReferences, remarkReferences } from "../../completion/index.js";

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

export const MarkdownComponent: React.FC<MarkdownComponentProps> = ({
    children,
    references,
    allowMarkdown = false,
}) => {
    if (allowMarkdown) {
        return (
            <Markdown
                remarkPlugins={[remarkEmoji, remarkReferences()]}
                rehypePlugins={[rehypeReferences(references ?? [])]}
                components={componentMap}
                urlTransform={customUrlTransform}
            >
                {children}
            </Markdown>
        );
    }

    return <Typography tagName="p">{children}</Typography>;
};
