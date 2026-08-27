// (C) 2025-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { type IGenAIAssistantDisclaimerProps } from "./types.js";

/**
 * @beta
 */
export function DefaultDisclaimer(_props: IGenAIAssistantDisclaimerProps) {
    return (
        <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
            <FormattedMessage id="gd.gen-ai.disclaimer" />
        </Typography>
    );
}
