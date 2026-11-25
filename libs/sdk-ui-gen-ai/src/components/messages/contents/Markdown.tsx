// (C) 2024-2026 GoodData Corporation

import { type ComponentProps, type ReactNode, createContext, useContext, useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";
import Markdown, { type Components, type ExtraProps } from "react-markdown";
import { useSelector } from "react-redux";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

import { type CatalogItem } from "@gooddata/sdk-model";
import { Typography, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type TextContentObject } from "../../../model.js";
import { catalogItemsSelector } from "../../../store/chatWindow/chatWindowSelectors.js";
import { InfoComponent, getInfoTypeLabel } from "../../completion/InfoComponent.js";
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
            id={describedBy}
            offset={2}
            component="span"
            triggerBy={["hover", "focus"]}
            anchor={children}
            content={({ type }) =>
                // The chip's own text already gives the name and the type, so screen readers get just
                // the description, once. The full info is for the visible tooltip.
                type === "screen-reader" ? (
                    reference.description
                ) : (
                    <div className="gd-gen-ai-chat__chip__tooltip">
                        <InfoComponent
                            item={reference}
                            intl={intl}
                            id={reference.id}
                            canManage={canManage}
                            canAnalyze={canAnalyze}
                        />
                    </div>
                )
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

/**
 * References of the rendered message, read by the reference span renderer.
 *
 * They are passed through a context so that the component map handed to react-markdown stays stable.
 * A new component map would give every rendered element a new component type, and React would
 * re-create the DOM of the whole message on each re-render. Screen readers then announce the
 * re-inserted messages in the chat log again.
 */
const MarkdownReferencesContext = createContext<TextContentObject[] | undefined>(undefined);

function ReferenceSpan({ node, ...props }: ComponentProps<"span"> & ExtraProps) {
    const references = useContext(MarkdownReferencesContext);
    const catalogItems = useSelector(catalogItemsSelector);
    const intl = useIntl();

    return (
        createReferenceTooltip(intl, props, node?.properties, references, catalogItems) ?? <span {...props} />
    );
}

const componentMap: Components = {
    p: ({ children }) => <Typography tagName="p">{children}</Typography>,
    a: ({ children, href }) => <CustomHyperlink href={href ?? ""} text={children} />,
    h1: ({ children }) => <Typography tagName="h1">{children}</Typography>,
    h2: ({ children }) => <Typography tagName="h2">{children}</Typography>,
    h3: ({ children }) => <Typography tagName="h3">{children}</Typography>,
    hr: () => null,
    span: ReferenceSpan,
};

export function MarkdownComponent({ children, references, allowMarkdown = false }: MarkdownComponentProps) {
    const { text, tokens } = useMemo(() => extractReferences(children), [children]);

    return (
        <MarkdownReferencesContext.Provider value={references}>
            <Markdown
                remarkPlugins={allowMarkdown ? [remarkEmoji, remarkGfm, remarkReferences()] : []}
                rehypePlugins={[
                    ...(allowMarkdown ? [] : [rehypePlainText(text)]),
                    rehypeReferences(references ?? [], tokens),
                ]}
                components={componentMap}
                urlTransform={customUrlTransform}
            >
                {text}
            </Markdown>
        </MarkdownReferencesContext.Provider>
    );
}

function rehypePlainText(text: string) {
    return function () {
        return function () {
            // Replace parsed markup after conversion to HTML nodes to preserve whitespace as well as text.
            return {
                type: "root",
                children: [
                    {
                        type: "element",
                        tagName: "p",
                        properties: {},
                        children: [{ type: "text", value: text }],
                    },
                ],
            };
        };
    };
}

const OBJECT_CLASS_NAME = "gd-gen-ai-chat__message__object";

function createReferenceTooltip(
    intl: IntlShape,
    props: ComponentProps<"span">,
    properties: NonNullable<ExtraProps["node"]>["properties"] = {},
    references: TextContentObject[] = [],
    catalogItems: CatalogItem[] = [],
) {
    if (props.className?.includes(OBJECT_CLASS_NAME)) {
        const dataId = String(properties["data-id"] ?? "");
        const dataType = String(properties["data-type"] ?? "");
        const ref = findCatalogItemOrReference(references, catalogItems, dataId, dataType);
        if (ref) {
            const describedBy = `gd-gen-ai-chat__tooltip__reference-${ref.type}-${ref.id}`;
            const typeLabel = getInfoTypeLabel(ref.type, intl);
            return (
                <ReferenceTooltip intl={intl} reference={ref} describedBy={describedBy}>
                    <span {...props} aria-describedby={ref.description ? describedBy : undefined}>
                        {props.children}
                        {typeLabel ? <span className="sr-only">{`, ${typeLabel}`}</span> : null}
                    </span>
                </ReferenceTooltip>
            );
        }
    }
    return undefined;
}
