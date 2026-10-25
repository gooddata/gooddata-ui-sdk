// (C) 2007-2026 GoodData Corporation

import { type CSSProperties } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";

import { GEO_ATTRIBUTE } from "../../../constants/catalog_filters.js";
import { normalizeDraggedItemType } from "../../../models/bucket_rules.js";
import { canEditCatalogMetric } from "../../../selectors/metric_permissions_selector.js";
import { isLoadingItems } from "../../../store/catalog/catalog_selector.js";
import { metricEditorOpen } from "../../../store/metric_editor/metric_editor_actions.js";
import { type IAppState } from "../../../store/types.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";
import { getCssClass } from "../../../utils/css_class.js";
import { getCatalogItemTitle } from "../../../utils/translations.js";

import { CatalogDetailsBubble } from "./CatalogDetailsBubble.js";

export function getCatalogItemClassName(item: ICatalogEntry) {
    if (item.type === "date") {
        return "s-date";
    }

    return getCssClass(item.identifier, "s-id-");
}

export interface ICatalogItemOwnProps {
    item: ICatalogEntry;
    draggable?: boolean;
    bubbleHelp?: boolean;
    isDragging?: boolean;
    onMouseOver?: () => void;
    className?: string;
    style?: CSSProperties;
}

export interface ICatalogItemDispatchProps {
    openMetricEditorDialog?: (metricRef: ObjRef | undefined) => void;
}

export interface ICatalogItemStateProps {
    canEditItemAsMetric: boolean;
    isCatalogLoadingItems: boolean;
}

export type CatalogItemProps = ICatalogItemOwnProps & ICatalogItemDispatchProps & ICatalogItemStateProps;

const mapDispatchToProps: ICatalogItemDispatchProps = {
    openMetricEditorDialog: metricEditorOpen,
};

const mapStateToProps = (state: IAppState, ownProps: ICatalogItemOwnProps): ICatalogItemStateProps => ({
    canEditItemAsMetric:
        isMetricEntry(ownProps.item) && canEditCatalogMetric(state, ownProps.item.identifier),
    isCatalogLoadingItems: isLoadingItems(state),
});

function isMetricEntry(item: ICatalogEntry): boolean {
    return item.type === "measure" || item.type === "metric";
}

export const CatalogItem = connect<
    ICatalogItemStateProps,
    ICatalogItemDispatchProps,
    ICatalogItemOwnProps,
    IAppState
>(
    mapStateToProps,
    mapDispatchToProps,
)(function CatalogItem({
    item,
    style = {},
    bubbleHelp = true,
    isDragging = false,
    className = "",
    openMetricEditorDialog,
    canEditItemAsMetric,
    isCatalogLoadingItems,
}: CatalogItemProps) {
    const intl = useIntl();

    const getTypeClassName = (item: ICatalogEntry) => {
        // a computed attribute reads as a plain attribute in the catalog - it behaves like one in
        // every bucket, so it wears the attribute glyph rather than one of its own
        const type = item.isLocationIconVisible ? GEO_ATTRIBUTE : normalizeDraggedItemType(item.type);
        return `type-${type}`;
    };

    const renderTitle = () => {
        const title = getCatalogItemTitle(item, intl);

        return (
            <div className={classNames("s-catalog-item-title", "adi-catalog-item-title-tiger")}>{title}</div>
        );
    };

    const renderBubbleHelp = () => {
        if (bubbleHelp && !isDragging) {
            return <CatalogDetailsBubble item={item} />;
        }

        return null;
    };

    const renderEditMetricIcon = () => {
        const openMetricEditorDialogHandler = () => {
            if (isCatalogLoadingItems) {
                return;
            }

            const ref = item.ref;
            if (ref) {
                openMetricEditorDialog(ref);
            }
        };

        if (canEditItemAsMetric && bubbleHelp && !isDragging) {
            const editIconClasses = classNames(
                "inlineEditMetricIcon gd-bubble-trigger-wrap adi-catalog-item-edit-metric gd-icon-pencil",
                {
                    disabled: isCatalogLoadingItems,
                },
            );

            return <span className={editIconClasses} onClick={openMetricEditorDialogHandler} />;
        }
        return null;
    };

    const typeClassName = getTypeClassName(item);

    const combinedClassName = classNames(
        "adi-catalog-item",
        "s-catalog-item",
        "renaming-measure-enable",
        getCatalogItemClassName(item),
        {
            // Check for boolean - this property is set only by catalog and the style is only
            // used when item is rendered in catalog. We don't want to apply it when component
            // is used in bucket item.
            "not-available": item.available === false,
            "s-item-unavailable": item.available === false,
        },
        typeClassName,
        className,
    );

    return (
        <div className={combinedClassName} style={style}>
            {renderTitle()}
            {renderEditMetricIcon()}
            {renderBubbleHelp()}
        </div>
    );
});
