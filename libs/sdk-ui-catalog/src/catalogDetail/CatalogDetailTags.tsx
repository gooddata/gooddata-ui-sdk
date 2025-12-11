// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type UiTagDef, UiTags } from "@gooddata/sdk-ui-kit";

import { useCatalogTags } from "../catalogResource/index.js";

type Props = {
    tags: string[];
    canEdit: boolean;
    onTagClick: (tag: UiTagDef) => void;
    onTagAdd: (tag: UiTagDef) => void;
    onTagRemove: (tag: UiTagDef) => void;
};

export function CatalogDetailTags({ tags, canEdit, onTagClick, onTagAdd, onTagRemove }: Props) {
    const intl = useIntl();
    const { tags: catalogTags } = useCatalogTags();

    const itemTags = useMemo(
        () => tags.map((tag) => ({ id: tag, label: tag, isDeletable: canEdit })),
        [tags, canEdit],
    );

    const tagOptions = useMemo(() => catalogTags.map((tag) => ({ id: tag, label: tag })), [catalogTags]);

    return (
        <UiTags
            tags={itemTags}
            tagOptions={tagOptions}
            canCreateTag={canEdit}
            canDeleteTags={canEdit}
            mode="multi-line"
            onTagClick={onTagClick}
            onTagAdd={onTagAdd}
            onTagRemove={onTagRemove}
            addLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.addLabel" })}
            nameLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.nameLabel" })}
            cancelLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.cancelLabel" })}
            saveLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.saveLabel" })}
            removeLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.removeLabel" })}
            moreLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.more" })}
            noTagsLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.noTags" })}
            closeLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.close" })}
        />
    );
}
