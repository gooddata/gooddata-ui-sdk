// (C) 2025-2026 GoodData Corporation

import { type ReactNode, type RefObject, useImperativeHandle, useRef } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { EditableLabel, UiCard, UiCopyButton } from "@gooddata/sdk-ui-kit";

import { CatalogDetailGenerateDescription } from "./CatalogDetailGenerateDescription.js";
import { CatalogItemLockMemo } from "../catalogItem/CatalogItemLock.js";
import { type ICatalogItem } from "../catalogItem/types.js";
import { ObjectTypeIconMemo } from "../objectType/ObjectTypeIcon.js";
import { ObjectTypeTooltip } from "../objectType/ObjectTypeTooltip.js";

export interface ICatalogDetailHeaderRef {
    focusTitle: () => void;
    focusDescription: () => void;
}

interface IProps {
    item: ICatalogItem;
    canEdit: boolean;
    actions: ReactNode;
    updateItemTitle: (title: string) => void;
    updateItemDescription: (description: string) => void;
    isDescriptionGenerationEnabled: boolean;
    headerRef: RefObject<ICatalogDetailHeaderRef | null>;
}

export function CatalogDetailHeader({
    item,
    canEdit,
    actions,
    updateItemTitle,
    updateItemDescription,
    isDescriptionGenerationEnabled,
    headerRef,
}: IProps) {
    const intl = useIntl();

    const type = item.type ?? "analyticalDashboard";
    const visualizationType = item.visualizationType;
    const canGenerateDescription = canEdit && item.type !== "dataSet" && isDescriptionGenerationEnabled;

    const titleRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
        headerRef,
        () => ({
            focusTitle: () => {
                titleRef.current?.click();
            },
            focusDescription: () => {
                descriptionRef.current?.click();
            },
        }),
        [],
    );

    return (
        <UiCard elevation="1">
            <div className="gd-analytics-catalog-detail__card">
                <div className="gd-analytics-catalog-detail__card__header">
                    <div className="gd-analytics-catalog-detail__card__header__title">
                        <ObjectTypeTooltip
                            intl={intl}
                            type={type}
                            visualizationType={visualizationType}
                            anchor={
                                <ObjectTypeIconMemo
                                    intl={intl}
                                    type={type}
                                    visualizationType={visualizationType}
                                    backgroundSize={32}
                                />
                            }
                        />
                        {item?.isLocked ? <CatalogItemLockMemo intl={intl} /> : null}
                        <div className="gd-analytics-catalog-detail__card__header__title__name">
                            {canEdit ? (
                                <EditableLabel
                                    ref={titleRef}
                                    isEditableLabelWidthBasedOnText
                                    ariaLabel={intl.formatMessage({
                                        id: "analyticsCatalog.column.title.label",
                                    })}
                                    placeholder={intl.formatMessage({
                                        id: "analyticsCatalog.catalogItem.title.add",
                                    })}
                                    onSubmit={updateItemTitle}
                                    value={item.title}
                                    maxRows={9999}
                                >
                                    {item.title ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.catalogItem.title.add",
                                        })}
                                    <i className="gd-icon-pencil" />
                                </EditableLabel>
                            ) : (
                                <>{item.title}</>
                            )}
                        </div>
                    </div>
                    {canEdit ? (
                        <div className="gd-analytics-catalog-detail__card__header__row">
                            <div className="gd-analytics-catalog-detail__card__header__row__subtitle gd-analytics-catalog-detail__card__header__row__subtitle--with-action">
                                <span className="gd-analytics-catalog-detail__card__header__row__subtitle-label">
                                    <FormattedMessage id="analyticsCatalog.catalogItem.description" />
                                </span>
                                {canGenerateDescription ? (
                                    <CatalogDetailGenerateDescription
                                        item={item}
                                        onApplyDescription={updateItemDescription}
                                    />
                                ) : null}
                            </div>
                            <div className="gd-analytics-catalog-detail__card__header__row__content">
                                <EditableLabel
                                    ref={descriptionRef}
                                    maxRows={9999}
                                    ariaLabel={intl.formatMessage({
                                        id: "analyticsCatalog.catalogItem.description",
                                    })}
                                    placeholder={intl.formatMessage({
                                        id: "analyticsCatalog.catalogItem.description.add",
                                    })}
                                    isEditableLabelWidthBasedOnText
                                    onSubmit={updateItemDescription}
                                    value={item.description}
                                >
                                    {item.description ||
                                        intl.formatMessage({
                                            id: "analyticsCatalog.catalogItem.description.add",
                                        })}
                                    <i className="gd-icon-pencil" />
                                </EditableLabel>
                            </div>
                        </div>
                    ) : (
                        <>
                            {item.description ? (
                                <div className="gd-analytics-catalog-detail__card__header__row">
                                    <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                        <FormattedMessage id="analyticsCatalog.catalogItem.description" />
                                    </div>
                                    <div className="gd-analytics-catalog-detail__card__header__row__content">
                                        {item.description}
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                    <div>
                        <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                            <FormattedMessage id="analyticsCatalog.catalogItem.id" />
                        </div>
                        <div className="gd-analytics-catalog-detail__card__header__row__content">
                            {item.identifier}
                            <UiCopyButton clipboardContent={item.identifier} />
                        </div>
                    </div>
                </div>
                <div className="gd-analytics-catalog-detail__card__actions">{actions}</div>
            </div>
        </UiCard>
    );
}
