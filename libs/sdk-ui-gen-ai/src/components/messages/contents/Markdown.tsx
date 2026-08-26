// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";
import Markdown, { type Components } from "react-markdown";
import { useSelector } from "react-redux";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import { type CatalogItem } from "@gooddata/sdk-model";
import { Typography, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type TextContentObject } from "../../../model.js";
import { catalogItemsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { InfoComponent } from "../../completion/InfoComponent.js";
import { extractReferences } from "../../completion/plugins/reference-placeholder.js";
import { rehypeReferences } from "../../completion/plugins/rehype-references.js";
import { remarkReferences } from "../../completion/plugins/remark-references.js";
import { type IMetadataObjectBaseWithId, findCatalogItemOrReference } from "../../completion/utils.js";
import { useConfig } from "../../ConfigContext.js";

import { CustomHyperlink } from "./CustomHyperlink.js";

/**
 * Allow custom gooddata:// URL Schema
 */
const customUrlTransform = (url: string): string => {
    return /^http|https|mailto|tel|gooddata:/i.test(url) ? url : "";
};

function ReferenceTooltip({
    intl,
    reference,
    children,
    describedBy,
}: {
    intl: IntlShape;
    reference: IMetadataObjectBaseWithId;
    children: ReactNode;
    describedBy: string;
}) {
    const { canManage, canAnalyze } = useConfig();

    return (
        <UiTooltip
            offset={2}
            component="span"
            triggerBy={["hover", "focus"]}
            anchor={children}
            content={
                <div className="gd-gen-ai-chat__chip__tooltip" id={describedBy}>
                    <InfoComponent
                        item={reference}
                        intl={intl}
                        id={reference.id}
                        canManage={canManage}
                        canAnalyze={canAnalyze}
                    />
                </div>
            }
            arrowPlacement="right-start"
            optimalPlacement
            variant="none"
        />
    );
}

type MarkdownComponentProps = {
    children: string;
    allowMarkdown?: boolean;
    references?: TextContentObject[];
    onLinkClick?: (url: string) => void;
};

export function MarkdownComponent({ children, references, allowMarkdown = false }: MarkdownComponentProps) {
    const { text, tokens } = useMemo(() => extractReferences(children), [children]);
    const catalogItems = useSelector(catalogItemsSelector);
    const intl = useIntl();

    const componentMap: Components = useMemo(
        () => ({
            p: ({ children }) => <Typography tagName="p">{children}</Typography>,
            a: ({ children, href }) => <CustomHyperlink href={href ?? ""} text={children as string} />,
            h1: ({ children }) => <Typography tagName="h1">{children}</Typography>,
            h2: ({ children }) => <Typography tagName="h2">{children}</Typography>,
            h3: ({ children }) => <Typography tagName="h3">{children}</Typography>,
            hr: () => null,
            span: (props: any) => {
                return createReferenceTooltip(intl, props, references, catalogItems) ?? <span {...props} />;
            },
        }),
        [intl, references, catalogItems],
    );

    if (allowMarkdown) {
        return (
            <Markdown
                remarkPlugins={[remarkEmoji, remarkGfm, remarkReferences()]}
                rehypePlugins={[rehypeReferences(references ?? [], tokens)]}
                components={componentMap}
                urlTransform={customUrlTransform}
            >
                {text}
            </Markdown>
        );
    }

    return <Typography tagName="p">{children}</Typography>;
}

const OBJECT_CLASS_NAME = "gd-gen-ai-chat__message__object";

function createReferenceTooltip(
    intl: IntlShape,
    props: any,
    references: TextContentObject[] = [],
    catalogItems: CatalogItem[] = [],
) {
    const { className, ["data-id"]: dataId, ["data-type"]: dataType } = props;

    if (className?.includes(OBJECT_CLASS_NAME)) {
        const ref = findCatalogItemOrReference(references, catalogItems, dataId, dataType);
        if (ref) {
            const describedBy = `gd-gen-ai-chat__tooltip__reference-${ref.type}-${ref.id}`;
            return (
                <ReferenceTooltip intl={intl} reference={ref} describedBy={describedBy}>
                    <span {...props} aria-describedby={describedBy} />
                </ReferenceTooltip>
            );
        }
    }
    return undefined;
}
