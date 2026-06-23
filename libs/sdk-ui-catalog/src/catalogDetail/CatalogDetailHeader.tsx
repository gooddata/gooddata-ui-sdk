// (C) 2025-2026 GoodData Corporation

import { type ReactNode, type RefObject, useImperativeHandle, useRef } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import type { IObjectShareLabel } from "@gooddata/sdk-ui-ext";
import { EditableLabel, UiCard, UiCopyButton, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { CatalogItemLockMemo } from "../catalogItem/CatalogItemLock.js";
import { getVisualizationType, isCatalogItemAttribute, isCatalogItemFact } from "../catalogItem/guards.js";
import { type ICatalogItem } from "../catalogItem/types.js";
import { CertificationIconMemo } from "../certification/CertificationIcon.js";
import { ObjectTypeIconMemo } from "../objectType/ObjectTypeIcon.js";
import { ObjectTypeTooltip } from "../objectType/ObjectTypeTooltip.js";

import { CatalogDetailGenerateDescription } from "./CatalogDetailGenerateDescription.js";
import { CatalogDetailGenerateTitle } from "./CatalogDetailGenerateTitle.js";
import { CatalogDetailLabels } from "./share/CatalogDetailLabels.js";

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
    /** Labels of the shared attribute, shown in the header LABELS column. Empty for non-attributes. */
    labels?: IObjectShareLabel[];
    /** While true, the LABELS column shows a skeleton instead of the (not-yet-loaded) value. */
    labelsLoading?: boolean;
    /**
     * When true (object-level permissions on), the header shows the ID | Dataset |
     * Labels info row and the Dataset row is relocated here from the metadata tab.
     * When false, only the inline ID is shown and Dataset stays in the metadata tab
     * — so turning the flag off leaves the original layout untouched.
     */
    showInfoRow?: boolean;
}

export function CatalogDetailHeader({
    item,
    canEdit,
    actions,
    updateItemTitle,
    updateItemDescription,
    isDescriptionGenerationEnabled,
    headerRef,
    labels,
    labelsLoading,
    showInfoRow,
}: IProps) {
    const intl = useIntl();

    const type = item.type ?? "analyticalDashboard";
    const visualizationType = getVisualizationType(item);
    const canGenerateText = canEdit && item.type !== "dataSet" && isDescriptionGenerationEnabled;

    // Header info columns: ID is always shown; Dataset only for attributes/facts
    // that carry one; Labels for attributes — a skeleton while they load, then the
    // value (or nothing if the attribute turns out to have no permissionable labels).
    const datasetTitle =
        isCatalogItemAttribute(item) || isCatalogItemFact(item) ? item.dataSet?.title : undefined;
    const isAttribute = isCatalogItemAttribute(item);
    const hasLabels = isAttribute && (labels?.length ?? 0) > 0;
    const showLabelsColumn = isAttribute && (labelsLoading === true || hasLabels);

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
                <div className="gd-analytics-catalog-detail__card__top">
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
                                    canGenerateText ? (
                                        <CatalogDetailGenerateTitle
                                            key={item.identifier}
                                            ref={titleRef}
                                            item={item}
                                            onApplyTitle={updateItemTitle}
                                        />
                                    ) : (
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
                                    )
                                ) : (
                                    <>{item.title}</>
                                )}
                            </div>
                            <CertificationIconMemo
                                className="gd-analytics-catalog-detail__card__header__title__certified"
                                intl={intl}
                                certification={item.certification}
                            />
                        </div>
                        {canEdit ? (
                            <div className="gd-analytics-catalog-detail__card__header__row">
                                <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                    <FormattedMessage id="analyticsCatalog.catalogItem.description" />
                                </div>
                                <div className="gd-analytics-catalog-detail__card__header__row__content">
                                    {canGenerateText ? (
                                        <CatalogDetailGenerateDescription
                                            key={item.identifier}
                                            ref={descriptionRef}
                                            item={item}
                                            onApplyDescription={updateItemDescription}
                                        />
                                    ) : (
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
                                    )}
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
                        {showInfoRow ? null : (
                            <div className="gd-analytics-catalog-detail__card__header__row">
                                <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                    <FormattedMessage id="analyticsCatalog.catalogItem.id" />
                                </div>
                                <div className="gd-analytics-catalog-detail__card__header__row__content">
                                    {item.identifier}
                                    <UiCopyButton clipboardContent={item.identifier} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="gd-analytics-catalog-detail__card__actions">{actions}</div>
                </div>
                {showInfoRow ? (
                    <div className="gd-analytics-catalog-detail__card__info">
                        <div className="gd-analytics-catalog-detail__card__info__cell">
                            <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                <FormattedMessage id="analyticsCatalog.catalogItem.id" />
                            </div>
                            <div className="gd-analytics-catalog-detail__card__header__row__content">
                                {item.identifier}
                                <UiCopyButton clipboardContent={item.identifier} />
                            </div>
                        </div>
                        {datasetTitle ? (
                            <div className="gd-analytics-catalog-detail__card__info__cell">
                                <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                    <FormattedMessage id="analyticsCatalog.column.title.dataSet" />
                                </div>
                                <div className="gd-analytics-catalog-detail__card__header__row__content">
                                    {datasetTitle}
                                </div>
                            </div>
                        ) : null}
                        {showLabelsColumn ? (
                            <div className="gd-analytics-catalog-detail__card__info__cell">
                                <div className="gd-analytics-catalog-detail__card__header__row__subtitle">
                                    <FormattedMessage id="analyticsCatalog.column.title.labels" />
                                </div>
                                <div className="gd-analytics-catalog-detail__card__header__row__content">
                                    {labelsLoading ? (
                                        <UiSkeleton itemWidth={120} itemHeight={20} />
                                    ) : (
                                        <CatalogDetailLabels labels={labels ?? []} />
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </UiCard>
    );
}
