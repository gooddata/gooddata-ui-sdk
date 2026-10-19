// (C) 2026 GoodData Corporation

import { Fragment, type ReactNode, useId } from "react";

import cx from "classnames";
import { type MessageDescriptor, useIntl } from "react-intl";

import {
    type ILocalizationStatistics,
    type IUserLocalizationSettings,
    type LocalizationSettingType,
} from "@gooddata/sdk-backend-spi";
import { DropdownButton, type IUiListboxItem, Message, UiDropdown, UiListbox } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { type ListMode } from "../types.js";
import { QuestionMarkIcon } from "../Workspace/WorkspaceItem/QuestionMarkIcon.js";

import { USER_LANGUAGE_SETTINGS, languageName, languageNotice, languageOptions } from "./userLanguages.js";

const NOT_SET_ID = "not-set";
const LIST_MAX_HEIGHT = 250;

const LABELS: Record<LocalizationSettingType, MessageDescriptor> = {
    LOCALE: messages.userInterfaceLanguage,
    METADATA_LOCALE: messages.userMetadataLanguage,
    DATA_LOCALE: messages.userDataLanguage,
};

const NOT_SET_TOOLTIPS: Record<LocalizationSettingType, MessageDescriptor> = {
    LOCALE: messages.userInterfaceLanguageNotSetTooltip,
    METADATA_LOCALE: messages.userMetadataLanguageNotSetTooltip,
    DATA_LOCALE: messages.userDataLanguageNotSetTooltip,
};

export interface IUserLanguagesSectionProps {
    languages: IUserLocalizationSettings | undefined;
    isError: boolean;
    mode: ListMode;
    statistics?: ILocalizationStatistics;
    onChange?: (languages: IUserLocalizationSettings) => void;
}

export function UserLanguagesSection({
    languages,
    isError,
    mode,
    statistics,
    onChange,
}: IUserLanguagesSectionProps) {
    const intl = useIntl();
    const idPrefix = useId();

    const change = (type: LocalizationSettingType, value: string | undefined) => {
        onChange?.({ ...languages, [type]: value });
    };

    return (
        <>
            <div className="gd-user-management-dialog-detail-section-title">
                {intl.formatMessage(messages.userLanguagesTitle)}
            </div>
            {isError ? (
                <div className="gd-user-management-dialog-detail-value-empty s-user-languages-error">
                    {intl.formatMessage(messages.userLanguagesLoadError)}
                </div>
            ) : (
                USER_LANGUAGE_SETTINGS.map((type) => {
                    const notice = mode === "VIEW" && languages ? languageNotice(type, languages) : undefined;
                    return (
                        <Fragment key={type}>
                            <div
                                className={cx(
                                    "gd-user-management-dialog-detail-row",
                                    `s-user-language-${type}`,
                                )}
                            >
                                <div
                                    id={`${idPrefix}-${type}-label`}
                                    className="gd-user-management-dialog-detail-label"
                                >
                                    {intl.formatMessage(LABELS[type])}
                                </div>
                                {mode === "VIEW" ? (
                                    <LanguageValue type={type} code={languages?.[type]} />
                                ) : (
                                    <LanguageDropdown
                                        type={type}
                                        labelId={`${idPrefix}-${type}-label`}
                                        code={languages?.[type]}
                                        statistics={statistics}
                                        onSelect={(value) => change(type, value)}
                                    />
                                )}
                            </div>
                            {notice ? <LanguageNotSupportedMessage type={type} /> : null}
                        </Fragment>
                    );
                })
            )}
        </>
    );
}

function LanguageNotSupportedMessage({ type }: { type: LocalizationSettingType }) {
    const intl = useIntl();
    return (
        <Message
            type="error"
            className={cx("gd-user-management-dialog-detail-notice", `s-user-language-notice-${type}`)}
        >
            {intl.formatMessage(messages.userLanguageNotSupported, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
            })}
        </Message>
    );
}

function LanguageCode({ code }: { code: string }) {
    return <span className="gd-user-management-dialog-detail-code">{code}</span>;
}

function LanguageValue({ type, code }: { type: LocalizationSettingType; code: string | undefined }) {
    const intl = useIntl();

    if (!code) {
        return (
            <div className="gd-user-management-dialog-detail-value gd-user-management-dialog-detail-value-not-set">
                {intl.formatMessage(messages.userLanguageNotSet)}
                <QuestionMarkIcon bubbleTextId={NOT_SET_TOOLTIPS[type].id} />
            </div>
        );
    }

    return (
        <div className="gd-user-management-dialog-detail-value">
            {languageName(code, intl.locale)} <LanguageCode code={code} />
        </div>
    );
}

function LanguageDropdown({
    type,
    labelId,
    code,
    statistics,
    onSelect,
}: {
    type: LocalizationSettingType;
    labelId: string;
    code: string | undefined;
    statistics: ILocalizationStatistics | undefined;
    onSelect: (value: string | undefined) => void;
}) {
    const intl = useIntl();
    const optionLabel = (value: string | undefined) =>
        value
            ? intl.formatMessage(messages.userLanguageOption, {
                  name: languageName(value, intl.locale),
                  code: value,
              })
            : intl.formatMessage(messages.userLanguageNotSetOption);
    const items: IUiListboxItem<string | undefined, null>[] = [
        undefined,
        ...languageOptions(type, code, intl.locale, statistics),
    ].map((value) => ({
        type: "interactive",
        id: value ?? NOT_SET_ID,
        stringTitle: optionLabel(value),
        data: value,
    }));

    return (
        <UiDropdown
            width="same-as-anchor"
            closeOnParentScroll
            closeOnMouseDrag
            closeOnEscape
            autofocusOnOpen
            accessibilityConfig={{
                triggerRole: "combobox",
                popupRole: "listbox",
            }}
            renderButton={({ isOpen, toggleDropdown, ref, dropdownId }) => (
                <DropdownButton
                    value={
                        code ? (
                            <>
                                {languageName(code, intl.locale)} <LanguageCode code={code} />
                            </>
                        ) : (
                            intl.formatMessage(messages.userLanguageNotSet)
                        )
                    }
                    title={optionLabel(code)}
                    isOpen={isOpen}
                    isSmall={false}
                    onClick={toggleDropdown}
                    buttonRef={ref}
                    dropdownId={dropdownId}
                    accessibilityConfig={{
                        popupType: "listbox",
                        ariaLabelledBy: labelId,
                    }}
                    className="gd-user-management-dialog-detail-input s-user-language-dropdown"
                />
            )}
            renderBody={({ closeDropdown, ariaAttributes }) => (
                <UiListbox<string | undefined, null>
                    items={items}
                    selectedItemId={code ?? NOT_SET_ID}
                    maxHeight={LIST_MAX_HEIGHT}
                    ariaAttributes={{
                        ...ariaAttributes,
                        "aria-labelledby": labelId,
                    }}
                    onClose={closeDropdown}
                    onSelect={(item) => onSelect(item.data)}
                />
            )}
        />
    );
}
