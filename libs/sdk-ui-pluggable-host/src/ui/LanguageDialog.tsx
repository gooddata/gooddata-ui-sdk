// (C) 2026 GoodData Corporation

import { type ReactNode, useId, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { isLocale } from "@gooddata/sdk-model";
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
    useUiToast,
} from "@gooddata/sdk-ui-kit";

import { LANGUAGE_NAMES, type LanguageChoice, matchesLanguage } from "./languages.js";
import { type ILanguages } from "./useLanguages.js";
import "./LanguageDialog.scss";

const { b, e } = bemFactory("gd-language-dialog");

const DEFAULT_ITEM = "default";
const ERROR_TOAST_ID = "language-dialog-error";

/**
 * @internal
 */
export interface ILanguageDialogProps extends ILanguages {
    onClose: () => void;
}

/**
 * @internal
 */
export function LanguageDialog({
    currentLanguage,
    defaultLanguage,
    languages,
    changeLanguage,
    onClose,
}: ILanguageDialogProps) {
    const intl = useIntl();
    const { addError, remove } = useUiToast();
    const noteId = useId();
    const [selectedItem, setSelectedItem] = useState<string>(currentLanguage);
    const [status, setStatus] = useState<"idle" | "saving">("idle");
    const title = intl.formatMessage({ id: "languageDialog.title" });
    const items: LanguageChoice[] = [DEFAULT_ITEM, ...languages];
    // "English (US)" becomes "Default (English US)", without brackets in brackets
    const defaultItemLabel = intl.formatMessage(
        { id: "languageDialog.default" },
        { language: LANGUAGE_NAMES[defaultLanguage].nativeName.replace(/[()]/g, "") },
    );

    function handleClose() {
        if (status === "saving") {
            return;
        }

        remove(ERROR_TOAST_ID);
        onClose();
    }

    function handleApply() {
        if (selectedItem === currentLanguage) {
            handleClose();
        } else if (selectedItem === DEFAULT_ITEM || isLocale(selectedItem)) {
            // Such states should be ideally handled with something like Tanstack Query and tested in a flexible way through Mock Service Worker
            setStatus("saving");
            remove(ERROR_TOAST_ID);
            changeLanguage(selectedItem)
                .then(onClose)
                .catch(() => {
                    setStatus("idle");
                    addError(
                        { descriptor: { id: "languageDialog.error" } },
                        { id: ERROR_TOAST_ID, sticky: true },
                    );
                });
        }
    }

    return (
        <UiModalDialog isOpen onClose={handleClose} width={540} variant="confirmation">
            <div className={b()}>
                <UiDialogHeader title={title} onClose={handleClose} />
                <UiDialogBody>
                    <div className={e("select")}>
                        <UiSearchableSelect
                            accessibilityConfig={{ ariaLabel: title, ariaDescribedBy: noteId }}
                            items={items}
                            value={selectedItem}
                            onChange={setSelectedItem}
                            placeholder={title}
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
                            <UiSearchableSelectList<LanguageChoice>
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
                        onClick={handleClose}
                    />
                    <UiButton
                        label={intl.formatMessage({ id: "apply" })}
                        variant="primary"
                        size="medium"
                        isPending={status === "saving"}
                        onClick={handleApply}
                    />
                </UiDialogFooter>
            </div>
        </UiModalDialog>
    );
}
