// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { AttributeBar } from "../components/bars/AttributeBar.js";
import { DateBar } from "../components/bars/DateBar.js";
import { KdaBar } from "../components/KdaBar.js";
import { useKdaState } from "../providers/KdaState.js";

export function FiltersBar() {
    const intl = useIntl();
    const { state } = useKdaState();

    return (
        <KdaBar
            title={intl.formatMessage({ id: "kdaDialog.dialog.bars.filters.title" })}
            content={
                <>
                    <DateBar date={state.dateFilter} />
                    <AttributeBar attribute={state.attributeFilter} />
                </>
            }
        />
    );
}
