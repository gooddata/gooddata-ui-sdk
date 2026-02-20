// (C) 2026 GoodData Corporation

import { type RefObject } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { Dropdown, DropdownButton, EditableLabel, UiListbox } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";
import { type ICatalogItem } from "../catalogItem/types.js";

const CERTIFICATION_STATUS = {
    CERTIFIED: "CERTIFIED",
    NOT_CERTIFIED: "NOT_CERTIFIED",
} as const;

type Props = {
    item: ICatalogItem;
    canEdit: boolean;
    onCertificationChange: (certification: ICatalogItem["certification"]) => void;
};

export function CatalogDetailTabCertification({ item, canEdit, onCertificationChange }: Props) {
    const intl = useIntl();
    const isCertified = item.certification?.status === "CERTIFIED";
    const message = item.certification?.message ?? "";

    const statusLabel = isCertified
        ? intl.formatMessage({ id: "analyticsCatalog.certification.field.status.certified" })
        : intl.formatMessage({ id: "analyticsCatalog.certification.field.status.notCertified" });

    const handleStatusSelect = (value: string) => {
        if (value === CERTIFICATION_STATUS.CERTIFIED) {
            onCertificationChange(message ? { status: "CERTIFIED", message } : { status: "CERTIFIED" });
        } else {
            onCertificationChange(undefined);
        }
    };

    const handleMessageSubmit = (newMessage: string) => {
        onCertificationChange({ status: "CERTIFIED", message: newMessage });
    };

    return (
        <dl className="gd-analytics-catalog-detail__tab-content gd-analytics-catalog-detail__tab-certification">
            <CatalogDetailContentRow
                title={<FormattedMessage id="analyticsCatalog.certification.field.status" />}
                content={
                    <Dropdown
                        alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
                        className="gd-analytics-catalog-detail__tab-certification__status-dropdown"
                        renderButton={({ toggleDropdown, isOpen, dropdownId, buttonRef }) => (
                            <DropdownButton
                                value={statusLabel}
                                disabled={!canEdit}
                                isOpen={isOpen}
                                onClick={toggleDropdown}
                                dropdownId={dropdownId}
                                buttonRef={buttonRef as RefObject<HTMLElement>}
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({
                                        id: "analyticsCatalog.certification.field.status",
                                    }),
                                    popupType: "listbox",
                                }}
                            />
                        )}
                        renderBody={({ closeDropdown, ariaAttributes }) => {
                            const listboxItems = [
                                {
                                    type: "interactive" as const,
                                    id: CERTIFICATION_STATUS.NOT_CERTIFIED,
                                    stringTitle: intl.formatMessage({
                                        id: "analyticsCatalog.certification.field.status.notCertified",
                                    }),
                                    data: null,
                                },
                                {
                                    type: "interactive" as const,
                                    id: CERTIFICATION_STATUS.CERTIFIED,
                                    stringTitle: intl.formatMessage({
                                        id: "analyticsCatalog.certification.field.status.certified",
                                    }),
                                    data: null,
                                },
                            ];

                            return (
                                <UiListbox
                                    shouldKeyboardActionStopPropagation
                                    shouldKeyboardActionPreventDefault
                                    dataTestId="gd-certification-status-list"
                                    items={listboxItems}
                                    selectedItemId={
                                        isCertified
                                            ? CERTIFICATION_STATUS.CERTIFIED
                                            : CERTIFICATION_STATUS.NOT_CERTIFIED
                                    }
                                    onSelect={(item) => {
                                        handleStatusSelect(item.id);
                                        closeDropdown();
                                    }}
                                    onClose={closeDropdown}
                                    ariaAttributes={ariaAttributes}
                                />
                            );
                        }}
                    />
                }
            />
            {isCertified ? (
                <CatalogDetailContentRow
                    title={<FormattedMessage id="analyticsCatalog.certification.field.message" />}
                    content={
                        <div className="gd-analytics-catalog-detail__tab-certification__message">
                            {canEdit ? (
                                <EditableLabel
                                    ariaLabel={intl.formatMessage({
                                        id: "analyticsCatalog.certification.field.message",
                                    })}
                                    placeholder={intl.formatMessage({
                                        id: "analyticsCatalog.certification.field.message.placeholder",
                                    })}
                                    isEditableLabelWidthBasedOnText
                                    onSubmit={handleMessageSubmit}
                                    value={message}
                                >
                                    {message ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.certification.field.message.placeholder",
                                        })}
                                    <i className="gd-icon-pencil" />
                                </EditableLabel>
                            ) : (
                                <>
                                    {message ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.certification.field.message.placeholder",
                                        })}
                                </>
                            )}
                        </div>
                    }
                />
            ) : null}
        </dl>
    );
}
