// (C) 2026 GoodData Corporation

import { type ReactNode, useId, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type ILocale, isLocale } from "@gooddata/sdk-model";
import {
    Message,
    UiButton,
    UiDialogBody,
    UiDialogFooter,
    UiDialogHeader,
    UiModalDialog,
    UiSearchableSelect,
    UiSearchableSelectDivider,
    UiSearchableSelectItem,
    UiSearchableSelectList,
    UiSearchableSelectSearch,
    bemFactory,
} from "@gooddata/sdk-ui-kit";

import { LANGUAGE_NAMES, matchesLanguage } from "./languages.js";
import { type ILanguages } from "./useLanguages.js";
import "./LanguageDialog.scss";

const { b, e } = bemFactory("gd-language-dialog");

const DEFAULT_ITEM = "default";

type LanguageItem = ILocale | typeof DEFAULT_ITEM;

const keepOpen = () => {};

/**
 * @internal
 */
export interface ILanguageDialogProps extends ILanguages {
    onClose: () => void;
}

/**
 * Lets the user change the language of the interface for themselves (ATEAM-25).
 *
 * @internal
 */
export function LanguageDialog({
    currentLanguage,
    defaultLanguage,
    languages,
    setLanguage,
    deleteLanguage,
    onClose,
}: ILanguageDialogProps) {
    const intl = useIntl();
    const noteId = useId();
    const currentItem = currentLanguage ?? DEFAULT_ITEM;
    const [selectedItem, setSelectedItem] = useState<string>(currentItem);
    const title = intl.formatMessage({ id: "languageDialog.title" });
    const items: LanguageItem[] = [DEFAULT_ITEM, ...languages];
    // "English (US)" becomes "Default (English US)", without brackets in brackets
    const defaultItemLabel = intl.formatMessage(
        { id: "languageDialog.default" },
        { language: LANGUAGE_NAMES[defaultLanguage].nativeName.replace(/[()]/g, "") },
    );

    // the dialog closes once the language is saved; a failure keeps it open (the error toast comes later)
    const apply = () => {
        // as in TimezoneDialog, applying an unchanged language only closes the dialog
        if (selectedItem === currentItem) {
            onClose();
        } else if (selectedItem === DEFAULT_ITEM) {
            void deleteLanguage().then(onClose, keepOpen);
        } else if (isLocale(selectedItem)) {
            void setLanguage(selectedItem).then(onClose, keepOpen);
        }
    };

    return (
        <UiModalDialog isOpen onClose={onClose} width={540} variant="confirmation">
            <div className={b()}>
                <UiDialogHeader title={title} onClose={onClose} />
                <UiDialogBody>
                    <div className={e("select")}>
                        <UiSearchableSelect
                            accessibilityConfig={{ ariaLabel: title, ariaDescribedBy: noteId }}
                            items={items}
                            value={selectedItem}
                            onChange={setSelectedItem}
                            placeholder={title}
                            // the default language is offered only when not searching, as it isn't a
                            // language of its own
                            filter={(item, query) =>
                                item === DEFAULT_ITEM ? !query : matchesLanguage(item, query)
                            }
                        >
                            <UiSearchableSelectSearch
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({
                                        id: "languageDialog.select.searchLabel",
                                    }),
                                }}
                                placeholder={intl.formatMessage({
                                    id: "languageDialog.select.searchPlaceholder",
                                })}
                            />
                            <UiSearchableSelectList<LanguageItem>
                                noItemsText={intl.formatMessage({ id: "languageDialog.select.noMatch" })}
                            >
                                {(item) =>
                                    item === DEFAULT_ITEM ? (
                                        <>
                                            <UiSearchableSelectItem id={item}>
                                                {defaultItemLabel}
                                            </UiSearchableSelectItem>
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
                    </div>
                    <Message id={noteId} type="progress" className={e("note")}>
                        <FormattedMessage
                            id="languageDialog.description"
                            values={{ b: (chunks: ReactNode) => <strong>{chunks}</strong> }}
                        />
                    </Message>
                </UiDialogBody>
                <UiDialogFooter divider>
                    <UiButton
                        label={intl.formatMessage({ id: "cancel" })}
                        variant="secondary"
                        size="medium"
                        onClick={onClose}
                    />
                    <UiButton
                        label={intl.formatMessage({ id: "apply" })}
                        variant="primary"
                        size="medium"
                        onClick={apply}
                    />
                </UiDialogFooter>
            </div>
        </UiModalDialog>
    );
}
