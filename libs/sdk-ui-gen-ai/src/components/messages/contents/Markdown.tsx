// (C) 2024 GoodData Corporation

import React from "react";
import Markdown, { Components } from "react-markdown";
import { Hyperlink, Typography } from "@gooddata/sdk-ui-kit";

const componentMap: Components = {
    p: ({ children }) => <Typography tagName="p">{children}</Typography>,
    a: ({ children, href }) => <Hyperlink href={href ?? ""} text={children as string} />,
    h1: ({ children }) => <Typography tagName="h1">{children}</Typography>,
    h2: ({ children }) => <Typography tagName="h2">{children}</Typography>,
    h3: ({ children }) => <Typography tagName="h3">{children}</Typography>,
};

type MarkdownComponentProps = {
    children: string;
    allowMarkdown?: boolean;
};

export const MarkdownComponent: React.FC<MarkdownComponentProps> = ({ children, allowMarkdown = false }) => {
    if (allowMarkdown) {
        return <Markdown components={componentMap}>{children}</Markdown>;
    }

    return <Typography tagName="p">{children}</Typography>;
};
