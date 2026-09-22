// (C) 2026 GoodData Corporation

import { type ReactNode, useId } from "react";

import { useIntl } from "react-intl";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { UiTooltip } from "../@ui/UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IRestrictedReferenceMarkerProps {
    /** Styling for the inline marker that replaces the inaccessible value. */
    className?: string;
    children?: ReactNode;
}

/**
 * The marker of a restricted reference: the word that stands where a value cannot be shown, with the
 * reason in a tooltip. It is text and never a control - what an editor may do about the reference is
 * decided where the text is edited, not on the word itself.
 *
 * @internal
 */
export function RestrictedReferenceMarker({ className, children }: IRestrictedReferenceMarkerProps) {
    const intl = useIntl();
    // the tooltip keeps a copy of the reason for assistive technology; naming it is what lets the
    // marker point at it, so the reason is heard and not only seen
    const reasonId = useId();

    const reason = intl.formatMessage({ id: "richText.restricted.reason" });

    return (
        <UiTooltip
            id={reasonId}
            component="span"
            inlineAnchor
            triggerBy={["hover", "focus"]}
            content={reason}
            anchor={
                // reachable by keyboard, so the reason is not for pointers alone; still not a control
                <span className={className} tabIndex={0} aria-describedby={reasonId}>
                    <UiIcon type="lock" size={14} color="complementary-6" layout="block" />
                    {children}
                </span>
            }
        />
    );
}
