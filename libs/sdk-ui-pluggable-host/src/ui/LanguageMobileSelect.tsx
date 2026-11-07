// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { LANGUAGE_NAMES, isLocale } from "@gooddata/sdk-model";
import {
    Message,
    UiSearchableSelect,
    UiSearchableSelectDivider,
    UiSearchableSelectItem,
    UiSearchableSelectList,
    UiSearchableSelectSearch,
    bemFactory,
    useUiToast,
} from "@gooddata/sdk-ui-kit";

import { type LanguageChoice, matchesLanguage } from "./languages.js";
import { type ILanguages } from "./useLanguages.js";
import "./LanguageMobileSelect.scss";

const { e } = bemFactory("gd-language-mobile-select");

const DEFAULT_ITEM = "default";
const ERROR_TOAST_ID = "language-mobile-select-error";
const SAVING_TOAST_ID = "language-mobile-select-saving";

/**
 * @internal
 */
export interface ILanguageMobileSelectProps extends ILanguages {
    onClose: () => void;
}

/**
 * @internal
 */
export function LanguageMobileSelect({
    changeLanguage,
    currentLanguage,
    defaultLanguage,
    languages,
    onClose,
}: ILanguageMobileSelectProps) {
    const intl = useIntl();
    const { addError, addInfo, remove } = useUiToast();
    const [pendingLanguage, setPendingLanguage] = useState<LanguageChoice | null>(null);
    const isSaving = pendingLanguage !== null;
    const title = intl.formatMessage({ id: "languageDialog.title" });
    const items: LanguageChoice[] = [DEFAULT_ITEM, ...languages];
    const defaultItemLabel = intl.formatMessage(
        { id: "languageDialog.default" },
        { language: LANGUAGE_NAMES[defaultLanguage].nativeName.replace(/[()]/g, "") },
    );

    return (
        <UiSearchableSelect
            accessibilityConfig={{ ariaLabel: title }}
            filter={(item, query) => (item === DEFAULT_ITEM ? !query : matchesLanguage(item, query))}
            isOpen
            items={items}
            onChange={(item) => {
                if (!isSaving && (item === DEFAULT_ITEM || isLocale(item))) {
                    remove(ERROR_TOAST_ID);
                    setPendingLanguage(item);
                    addInfo(
                        { descriptor: { id: "languageDialog.saving" } },
                        { id: SAVING_TOAST_ID, sticky: true },
                    );
                    changeLanguage(item)
                        .then(() => {
                            remove(SAVING_TOAST_ID);
                            onClose();
                        })
                        .catch(() => {
                            remove(SAVING_TOAST_ID);
                            setPendingLanguage(null);
                            addError(
                                { descriptor: { id: "languageDialog.error" } },
                                { id: ERROR_TOAST_ID, sticky: true },
                            );
                        });
                }
            }}
            onOpenChange={(isOpen) => {
                if (!isOpen && !isSaving) {
                    remove(ERROR_TOAST_ID);
                    onClose();
                }
            }}
            placeholder={title}
            renderButton={null}
            shouldCloseOnSelect={false}
            title={title}
            value={pendingLanguage ?? currentLanguage}
        >
            <Message type="progress" className={e("note")}>
                <FormattedMessage
                    id="languageDialog.description"
                    values={{ b: (chunks: ReactNode) => <strong>{chunks}</strong> }}
                />
            </Message>
            <UiSearchableSelectSearch
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage({ id: "languageDialog.select.searchLabel" }),
                }}
                placeholder={intl.formatMessage({ id: "languageDialog.select.searchPlaceholder" })}
            />
            <UiSearchableSelectList<LanguageChoice>
                noItemsText={intl.formatMessage({ id: "languageDialog.select.noMatch" })}
            >
                {(item) =>
                    item === DEFAULT_ITEM ? (
                        <>
                            <UiSearchableSelectItem id={item}>{defaultItemLabel}</UiSearchableSelectItem>
                            <UiSearchableSelectDivider />
                        </>
                    ) : (
                        <UiSearchableSelectItem id={item} lang={item}>
                            {LANGUAGE_NAMES[item].nativeName}
                        </UiSearchableSelectItem>
                    )
                }
            </UiSearchableSelectList>
        </UiSearchableSelect>
    );
}
