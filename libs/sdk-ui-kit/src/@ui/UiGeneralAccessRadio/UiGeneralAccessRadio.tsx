// (C) 2026 GoodData Corporation

import { type ReactNode, useId } from "react";

import { useIntl } from "react-intl";

import { olpGeneralAccessMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiRadioRow } from "../UiRadioRow/UiRadioRow.js";

const { b } = bem("gd-ui-kit-general-access-radio");

/**
 * Which general-access option is currently selected.
 *
 * @internal
 */
export type GeneralAccessValue = "RESTRICTED" | "WORKSPACE";

/**
 * @internal
 */
export interface IUiGeneralAccessRadioProps {
    /** Selected option. */
    value: GeneralAccessValue;
    /** Fired when the user picks a different option. */
    onChange: (value: GeneralAccessValue) => void;
    /** Disables both rows — e.g. while the access list is still loading. */
    disabled?: boolean;
    /**
     * Optional slot rendered to the right of the `All workspace members`
     * row — typically the `UiGranteeRowControls` pair that lets the
     * author pick labels and the workspace-wide permission level.
     */
    workspaceControls?: ReactNode;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Two-row radio used by the OLP share dialog to choose between restricting
 * access to the listed grantees and granting access to every workspace
 * member. Composes `UiRadioRow` for each option.
 *
 * @internal
 */
export function UiGeneralAccessRadio({
    value,
    onChange,
    disabled,
    workspaceControls,
    dataTestId,
}: IUiGeneralAccessRadioProps) {
    const intl = useIntl();
    const name = useId();
    return (
        <div
            className={b()}
            data-testid={dataTestId}
            role="radiogroup"
            aria-label={intl.formatMessage(olpGeneralAccessMessages.groupLabel)}
        >
            <UiRadioRow
                name={name}
                value="RESTRICTED"
                checked={value === "RESTRICTED"}
                disabled={disabled}
                title={intl.formatMessage(olpGeneralAccessMessages.restrictedTitle)}
                description={intl.formatMessage(olpGeneralAccessMessages.restrictedDescription)}
                onChange={() => onChange("RESTRICTED")}
            />
            <UiRadioRow
                name={name}
                value="WORKSPACE"
                checked={value === "WORKSPACE"}
                disabled={disabled}
                title={intl.formatMessage(olpGeneralAccessMessages.workspaceTitle)}
                description={intl.formatMessage(olpGeneralAccessMessages.workspaceDescription)}
                onChange={() => onChange("WORKSPACE")}
                trailing={workspaceControls}
            />
        </div>
    );
}
