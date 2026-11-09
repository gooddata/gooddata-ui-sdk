// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { useIntl } from "react-intl";

import { type OverridableFeatureFlag } from "@gooddata/sdk-backend-tiger";
import { UiConfigEditor } from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { formatDraftText } from "./overrideRules.js";

const JSON_ONLY = ["json" as const];

export interface IFeatureFlagJsonDetailProps {
    id: string;
    flag: OverridableFeatureFlag;
    serverValue: unknown;
    text: string;
    isDisabled: boolean;
    onTextChange: (flag: OverridableFeatureFlag, text: string) => void;
}

export function FeatureFlagJsonDetail({
    id,
    flag,
    serverValue,
    text,
    isDisabled,
    onTextChange,
}: IFeatureFlagJsonDetailProps) {
    const intl = useIntl();
    const labels = {
        syntaxError: intl.formatMessage({ id: "featureFlagOverrides.json.syntaxError" }),
        autoFormat: intl.formatMessage({ id: "featureFlagOverrides.json.autoFormat" }),
    };

    // The modal closes on an Escape from inside its card, which would drop the draft being typed.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            event.stopPropagation();
        }
    };

    return (
        <div id={id} className={e("detail")} onKeyDown={handleKeyDown}>
            <div className={e("pane")}>
                <div className={e("pane-label")}>
                    {intl.formatMessage({ id: "featureFlagOverrides.serverValueCaption" })}
                </div>
                <UiConfigEditor
                    value={formatDraftText(serverValue)}
                    onChange={noop}
                    readOnly
                    languages={JSON_ONLY}
                    rows={6}
                    labels={labels}
                    label={intl.formatMessage({ id: "featureFlagOverrides.json.serverLabel" }, { flag })}
                />
            </div>
            <div className={e("pane")}>
                <div className={e("pane-label")}>
                    {intl.formatMessage({ id: "featureFlagOverrides.json.overrideCaption" })}
                </div>
                <UiConfigEditor
                    value={text}
                    onChange={(next) => onTextChange(flag, next)}
                    disabled={isDisabled}
                    languages={JSON_ONLY}
                    rows={6}
                    labels={labels}
                    label={intl.formatMessage({ id: "featureFlagOverrides.json.overrideLabel" }, { flag })}
                />
            </div>
        </div>
    );
}

function noop() {}
