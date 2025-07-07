// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { Input } from "../../../Form/index.js";
import { Typography } from "../../../Typography/index.js";
import { compressForUrl } from "@gooddata/sdk-ui";
import { IShareLinkProps } from "./types.js";
import { isCopyKey } from "../../../utils/events.js";
import { SHARE_LINK_HEADLINE_ID, SHARE_LINK_HELPER_TEXT_ID } from "./utils.js";

/**
 * @internal
 */
export const ShareLink: React.FC<IShareLinkProps> = ({
    dashboardFilters,
    headline,
    helperText,
    buttonLabel,
    onShareLinkCopy,
}) => {
    const shareLink = useMemo(() => {
        const filters = { filters: compressForUrl(dashboardFilters ?? []) };
        const url = window.location.origin;
        const hashLocation = window.location.hash.split("?")[0];
        return url
            .concat("/dashboards/")
            .concat(hashLocation)
            .concat(`?${new URLSearchParams(filters).toString()}`);
    }, [dashboardFilters]);

    const onIconButtonClick = useCallback(() => {
        onShareLinkCopy?.(shareLink);
    }, [shareLink, onShareLinkCopy]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (isCopyKey(e)) {
                onShareLinkCopy?.(shareLink);
            }
        },
        [shareLink, onShareLinkCopy],
    );

    return (
        <>
            <div className="gd-share-dialog-grantee-content-header">
                <Typography id={SHARE_LINK_HEADLINE_ID} tagName="h3">
                    {headline}
                </Typography>
            </div>
            <Input
                value={shareLink}
                readonly={true}
                iconButton="copy"
                onIconButtonClick={onIconButtonClick}
                iconButtonLabel={buttonLabel}
                onKeyDown={onKeyDown}
                accessibilityConfig={{
                    ariaDescribedBy: SHARE_LINK_HELPER_TEXT_ID,
                    ariaLabelledBy: SHARE_LINK_HEADLINE_ID,
                }}
            />
            <div id={SHARE_LINK_HELPER_TEXT_ID} className="gd-share-dialog-share-link-helper-text">
                {helperText}
            </div>
        </>
    );
};
