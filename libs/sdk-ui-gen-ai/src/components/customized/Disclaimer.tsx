// (C) 2025-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

/**
 * @beta
 */
export function DefaultDisclaimer() {
    return (
        <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
            <FormattedMessage id="gd.gen-ai.disclaimer" />
        </Typography>
    );
}
