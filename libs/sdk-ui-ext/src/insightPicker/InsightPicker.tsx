// (C) 2026 GoodData Corporation

import { useContext } from "react";

import { IntlContext } from "react-intl";

import { InternalIntlWrapper } from "../internal/utils/internalIntlProvider.js";
import { InsightPickerCore } from "./InsightPickerCore.js";
import { type IInsightPickerProps } from "./types.js";

/**
 * InsightPicker - A reusable component for browsing, searching, and selecting insights.
 *
 * Features:
 * - Paginated insight list with "All" / "Created by me" tabs
 * - Hybrid search: local keyword matching + AI-powered semantic search
 * - Customizable three-dots action menu per item
 * - Description panel (question mark icon) support
 * - Tag-based filtering (include/exclude)
 *
 * Requires `BackendProvider` and `WorkspaceProvider` ancestors in the component tree,
 * or explicit `backend` and `workspace` props.
 *
 * @internal
 */
export function InsightPicker(props: IInsightPickerProps) {
    const intlContext = useContext(IntlContext);

    if (intlContext) {
        return <InsightPickerCore {...props} />;
    }

    return (
        <InternalIntlWrapper locale={props.locale}>
            <InsightPickerCore {...props} />
        </InternalIntlWrapper>
    );
}
