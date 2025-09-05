// (C) 2025 GoodData Corporation
import React, { memo, useMemo } from "react";

import type { IntlShape } from "react-intl";

import { type UiAsyncTableColumn, UiTags } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../../catalogItem/types.js";

export const tagsColumn: (
    intl: IntlShape,
    width: number,
    onTagClick?: (tag: string) => void,
) => UiAsyncTableColumn<ICatalogItem> = (intl, width, onTagClick) => {
    return {
        width,
        key: "tags",
        label: intl.formatMessage({ id: "analyticsCatalog.column.title.tags" }),
        //sortable: true,
        renderPrefixIcon: (item) => {
            return <TagsManagerMemo intl={intl} item={item} width={width} onTagClick={onTagClick} />;
        },
        getTextContent: () => "",
        getTextTitle: (item) => item.tags.join(", "),
    };
};

interface TagsManagerProps {
    intl: IntlShape;
    item: ICatalogItem;
    width: number;
    onTagClick?: (tag: string) => void;
}

const TagsManagerMemo = memo(function TagsManager({ intl, item, width, onTagClick }: TagsManagerProps) {
    const tags = useMemo(() => {
        return item.tags.map((tag, i) => {
            return {
                id: i.toString(),
                label: tag,
            };
        });
    }, [item.tags]);

    return (
        <div className="gd-analytics-catalog__tags-manager" style={{ width: width - 20 }}>
            <UiTags
                tags={tags}
                canCreateTag={false}
                canDeleteTags={false}
                mode="single-line"
                onTagClick={(tag) => onTagClick?.(tag.label)}
                moreLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.more" })}
                noTagsLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.noTags" })}
                closeLabel={intl.formatMessage({ id: "analyticsCatalog.tags.manager.label.close" })}
            />
        </div>
    );
});
