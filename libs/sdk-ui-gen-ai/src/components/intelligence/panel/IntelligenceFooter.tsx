// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { e } from "../intelligenceBem.js";

export interface IIntelligenceFooterProps {
    traceId: string;
}

/**
 * The panel's footer: the response's backend trace id. The "Trace ID:" label is the tooltip
 * trigger, explaining what it is for; the id itself is plain text. Renders nothing when there
 * is no trace id to show.
 */
export function IntelligenceFooter({ traceId }: IIntelligenceFooterProps) {
    const intl = useIntl();
    const tooltipText = intl.formatMessage({
        id: "gd.gen-ai.interactionIntelligence.footer.traceId.tooltip",
    });
    const label = intl.formatMessage({ id: "gd.gen-ai.interactionIntelligence.footer.traceId.label" });

    return (
        <div className={e("footer")}>
            <UiTooltip
                triggerBy={["hover", "focus"]}
                arrowPlacement="top"
                width={260}
                anchor={
                    <span className={e("footer__hint")} tabIndex={0}>
                        {label}
                    </span>
                }
                content={tooltipText}
            />
            <span className={e("footer__trace-id")}>{traceId}</span>
        </div>
    );
}
