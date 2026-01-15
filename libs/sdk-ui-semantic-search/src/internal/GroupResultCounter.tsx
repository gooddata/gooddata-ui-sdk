// (C) 2025-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

type Props = {
    count: number;
    isExpanded: boolean;
};

export function GroupResultCounter({ count, isExpanded }: Props) {
    if (!count) {
        return null;
    }
    return (
        <div className="gd-semantic-search__results-item__counter">
            <FormattedMessage tagName="span" id="semantic-search.results.count" values={{ count }} />
            <div
                className={cx(
                    "gd-semantic-search__results-item__counter__icon",
                    isExpanded && "gd-semantic-search__results-item__counter__icon--expanded",
                )}
            >
                <UiIcon type="navigateRight" size={16} color="complementary-6" />
            </div>
        </div>
    );
}
