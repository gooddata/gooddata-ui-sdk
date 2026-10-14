// (C) 2026 GoodData Corporation

import {
    type IPublisherSectionV2,
    type PublisherDocumentContentV2,
    isPublisherDocumentSectionsContentV2,
} from "./content.js";
import { newPublisherSectionIdV2 } from "./factory.js";

/**
 * Returns the sections of document content. Content stored as `pages` becomes one untitled section
 * with a generated id.
 *
 * @remarks
 * For content stored as `pages`, each call returns a new section id. Read once and keep the result
 * for as long as the section must stay the same one.
 *
 * @alpha
 */
export function publisherDocumentContentSectionsV2(
    content: PublisherDocumentContentV2,
): IPublisherSectionV2[] {
    if (isPublisherDocumentSectionsContentV2(content)) {
        return content.sections;
    }
    return [{ id: newPublisherSectionIdV2(), pages: content.pages }];
}

/**
 * @alpha
 */
export interface IPublisherDocumentContentSetSectionsOptionsV2 {
    /**
     * Content the sections were read from. Its other keys are kept.
     */
    content: PublisherDocumentContentV2;
    sections: IPublisherSectionV2[];
}

/**
 * Writes sections back into document content, in the shape the content was read in.
 *
 * @remarks
 * The result holds `sections` when the content held `sections`, when there is more than one section,
 * or when the only section has a title or description. Otherwise it holds `pages`, and the section's
 * id is dropped.
 *
 * @alpha
 */
export function publisherDocumentContentSetSectionsV2({
    content,
    sections,
}: IPublisherDocumentContentSetSectionsOptionsV2): PublisherDocumentContentV2 {
    const { pages: _pages, sections: _sections, ...rest } = content;
    if (isPublisherDocumentSectionsContentV2(content) || needsSections(sections)) {
        return { ...rest, sections };
    }
    return { ...rest, pages: sections.flatMap((section) => section.pages) };
}

function needsSections(sections: IPublisherSectionV2[]): boolean {
    return (
        sections.length > 1 ||
        sections.some(({ title, description }) => title !== undefined || description !== undefined)
    );
}
