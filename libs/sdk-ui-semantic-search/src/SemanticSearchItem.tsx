// (C) 2024-2025 GoodData Corporation

import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import type { IUiTreeviewItemProps } from "@gooddata/sdk-ui-kit";

import { SearchItemDetails } from "./internal/SearchItemDetails.js";
import { SearchItemIcon } from "./internal/SearchItemIcon.js";
import { SearchItem } from "./SearchItem.js";
import * as styles from "./SearchItemText.module.scss.js";
import { getAriaLabel } from "./utils/getAriaLabel.js";

type Props = IUiTreeviewItemProps<ISemanticSearchResultItem>;

/**
 * A single result item in the search results.
 * @internal
 */
export function SemanticSearchItem({ item, level, isFocused, onSelect, onHover, ariaAttributes }: Props) {
    return (
        <SearchItem
            ariaAttributes={{
                ...ariaAttributes,
                "aria-label": getAriaLabel(item.data),
            }}
            level={level}
            onClick={onSelect}
            onHover={onHover}
            isFocused={isFocused}
            icon={<SearchItemIcon item={item.data} />}
            details={<SearchItemDetails item={item.data} />}
        >
            <span className={styles.textRow}>
                <span className={styles.textEllipsis}>{item.stringTitle}</span>
            </span>
        </SearchItem>
    );
}
