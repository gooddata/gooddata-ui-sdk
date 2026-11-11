// (C) 2026 GoodData Corporation

import { type ReactNode, isValidElement } from "react";

/**
 * @internal
 */
export interface IUiSearchableSelectItemProps {
    id: string;
    /**
     * The language of the item's text when it differs from the page, e.g. "de" for "Deutsch". Set as the
     * option's `lang` attribute, like on a native `<option>`.
     */
    lang?: string;
    /**
     * Text shown muted after the title in the list, and after it on the button, e.g. the code of a language.
     * It is not matched by the default search, so use the select's `filter` to match it.
     */
    secondaryTitle?: string;
    /**
     * The option's title, shown in the list and the button and matched by the search.
     */
    children: string;
}

/**
 * Describes an option and renders nothing: UiSearchableSelectList reads its props and UiListbox renders
 * the option, like the `Item` of React Stately collections.
 *
 * @internal
 */
export function UiSearchableSelectItem(_props: IUiSearchableSelectItemProps) {
    return null;
}

export function getUiSearchableSelectItemDescriptor(
    node: ReactNode,
): { id: string; stringTitle: string; secondaryTitle?: string; lang?: string } | undefined {
    if (!isValidElement<IUiSearchableSelectItemProps>(node) || node.type !== UiSearchableSelectItem) {
        return undefined;
    }

    const { id, lang, secondaryTitle, children } = node.props;
    return { id, lang, secondaryTitle, stringTitle: children };
}
