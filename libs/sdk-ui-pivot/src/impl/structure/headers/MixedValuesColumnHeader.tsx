// (C) 2007-2025 GoodData Corporation
import { IHeaderGroupParams } from "ag-grid-community";
import cx from "classnames";

import { HEADER_LABEL_CLASS } from "../../base/constants.js";

export default function MixedValuesColumnHeader(_props: IHeaderGroupParams) {
    return (
        <div
            className={cx(
                "gd-pivot-table-header s-pivot-table-column-header s-pivot-table-mixed-values-column-header",
            )}
        >
            <div className={cx(HEADER_LABEL_CLASS, "gd-pivot-table-header-label")}></div>
        </div>
    );
}
