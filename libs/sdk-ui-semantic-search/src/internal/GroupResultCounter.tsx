// (C) 2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import * as styles from "../GroupResultCounterStyles.module.scss.js";

type Props = {
    count: number;
    isExpanded: boolean;
};

export function GroupResultCounter({ count, isExpanded }: Props) {
    if (!count) {
        return null;
    }
    return (
        <div className={styles.counter}>
            <FormattedMessage tagName="span" id="semantic-search.results.count" values={{ count }} />
            <div className={cx(styles.counterIcon, isExpanded && styles.counterIconExpanded)}>
                <UiIcon type="navigateRight" size={16} color="complementary-6" ariaHidden />
            </div>
        </div>
    );
}
