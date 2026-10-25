// (C) 2019-2026 GoodData Corporation

import { type Ref, memo, useCallback } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { GEO_ATTRIBUTE } from "../../../constants/catalog_filters.js";
import { CATALOG_LIST_ITEM } from "../../../constants/drag_item_types.js";
import { addFilter } from "../../../sagas/filter_bar/filter_bar_ui_actions.js";
import { isLocationIconEnabled as isLocationIconEnabledSelector } from "../../../services/reference_point_service.js";
import { getAcceptedTypes } from "../../../store/filter_bar/filter_bar_selector.js";
import { type FilterBarAcceptedType } from "../../../store/filter_bar/filter_bar_types.js";
import { type AppDispatch } from "../../../store/types.js";
import {
    type IDraggableCatalogListItem,
    type IInjectedDropTargetProps,
} from "../../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";

import {
    type IIsAllowedToDrop,
    canAcceptMoreItems as canAcceptMoreItemsSelector,
    isAllowedToDrop,
} from "./filter_bar_drop_target_selector.js";

const filterAddPlaceholderMessageIds = {
    "attribute.date": defineMessage({ id: "dashboard.bucket.filter.attribute.date.add_placeholder" }).id,
    "geo_attribute.attribute.date": defineMessage({
        id: "dashboard.bucket.filter.geo_attribute.attribute.date.add_placeholder",
    }).id,
} as const;

const filterDropzoneHintMessageIds = {
    "attribute.date": defineMessage({ id: "dashboard.bucket.filter.attribute.date.dropzone_hint" }).id,
    "attribute.metric.date": defineMessage({
        id: "dashboard.bucket.filter.attribute.metric.date.dropzone_hint",
    }).id,
    "geo_attribute.attribute.date": defineMessage({
        id: "dashboard.bucket.filter.geo_attribute.attribute.date.dropzone_hint",
    }).id,
    "geo_attribute.attribute.metric.date": defineMessage({
        id: "dashboard.bucket.filter.geo_attribute.attribute.metric.date.dropzone_hint",
    }).id,
} as const;

interface IFilterBarDropTargetStateProps {
    itemIsAllowedToDrop: IIsAllowedToDrop;
    canAcceptMoreItems: boolean;
    acceptedTypes: ReadonlyArray<FilterBarAcceptedType>;
    isLocationIconEnabled?: boolean;
}

interface IFilterBarDropTargetDispatchProps {
    onFilterItemDropped: (catalogItem: ICatalogEntry) => void;
}

export type IFilterBarDropTargetProps = IFilterBarDropTargetDispatchProps &
    IFilterBarDropTargetStateProps &
    IInjectedDropTargetProps;

export const PureFilterBarDropTarget = memo(function PureFilterBarDropTarget({
    canDrop: canDropProp,
    isOver: isOverProp,
    isSmallScreen,
}: IInjectedDropTargetProps) {
    const itemIsAllowedToDrop: IIsAllowedToDrop = useSelector(isAllowedToDrop);
    const canAcceptMoreItems = useSelector(canAcceptMoreItemsSelector);
    const defaultAcceptedTypes = useSelector(getAcceptedTypes);
    const isLocationIconEnabled = useSelector(isLocationIconEnabledSelector);

    const dispatch = useDispatch<AppDispatch>();
    const onFilterItemDropped = useCallback(
        // a drop adds exactly one filter, whose picker then opens right away
        (catalogItem: ICatalogEntry, bucketItemLocalIdentifier?: string) =>
            dispatch(addFilter(catalogItem, bucketItemLocalIdentifier, true)),
        [dispatch],
    );

    const [{ canDrop, isOver }, dropRef] = useDrop(
        () => ({
            accept: [CATALOG_LIST_ITEM],
            drop: (_item: unknown, monitor) => {
                dropConfig.drop({ onFilterItemDropped }, monitor);
            },
            canDrop: (_item, monitor) => dropConfig.canDrop({ itemIsAllowedToDrop }, monitor),
            collect: (monitor) => ({
                canDrop: monitor.canDrop(),
                isOver: monitor.isOver(),
            }),
        }),
        [onFilterItemDropped, itemIsAllowedToDrop],
    );

    const effectiveCanDrop = canDropProp ?? canDrop;
    const effectiveIsOver = isOverProp ?? isOver;
    const renderInvitation = () => {
        const locationAcceptedTypes = [GEO_ATTRIBUTE, ...defaultAcceptedTypes];
        const acceptedTypes = isLocationIconEnabled ? locationAcceptedTypes : defaultAcceptedTypes;
        const acceptsJoinedStr = acceptedTypes.join(".");

        let dropzoneMessageId = "";

        if (canDrop || isSmallScreen) {
            dropzoneMessageId = defineMessage({ id: "dashboard.bucket.drop" }).id;
        } else if (acceptedTypes.length) {
            dropzoneMessageId =
                filterAddPlaceholderMessageIds[
                    acceptsJoinedStr as keyof typeof filterAddPlaceholderMessageIds
                ] ?? `dashboard.bucket.${acceptsJoinedStr}.add_placeholder`;
        } else {
            return null;
        }

        const bubbleMessageId =
            filterDropzoneHintMessageIds[acceptsJoinedStr as keyof typeof filterDropzoneHintMessageIds] ??
            `dashboard.bucket.filter.${acceptsJoinedStr}.dropzone_hint`;

        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div
                    className={classNames("adi-bucket-invitation", "s-bucket-invitation-filters", {
                        "adi-bucket-invitation-small": isSmallScreen,
                    })}
                >
                    <div className="adi-bucket-invitation-inner">
                        <FormattedMessage
                            id={dropzoneMessageId}
                            values={{
                                factIcon: <span className="fact-field-icon" />,
                                metricIcon: <span className="metric-field-icon" />,
                                attrIcon: <span className="attr-field-icon" />,
                                geoAttrIcon: <span className="geo-attr-field-icon" />,
                                dateIcon: <span className="date-field-icon" />,
                            }}
                        />
                    </div>
                </div>
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                    <FormattedMessage
                        id={bubbleMessageId}
                        values={{
                            factIcon: <span className="fact-field-icon" />,
                            metricIcon: <span className="metric-field-icon" />,
                            attrIcon: <span className="attr-field-icon" />,
                            geoAttrIcon: <span className="geo-attr-field-icon" />,
                            dateIcon: <span className="date-field-icon" />,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        );
    };

    const dropZoneClassNames = classNames("adi-bucket-dropzone", "s-bucket-dropzone", {
        "adi-droppable-active": effectiveCanDrop,
        "adi-droppable-hover": effectiveIsOver && effectiveCanDrop,
    });

    return (
        <div
            className={classNames({ invisible: !canAcceptMoreItems })}
            ref={dropRef as unknown as Ref<HTMLDivElement>}
        >
            <div className={dropZoneClassNames} data-bubbletitlealignpoints="cr cl">
                <div className="adi-bucket-invitation-outer">{renderInvitation()}</div>
            </div>
        </div>
    );
});

export const dropConfig = {
    drop(props: Partial<IFilterBarDropTargetProps>, monitor: DropTargetMonitor): void {
        const cacheItem: ICatalogEntry = (monitor.getItem() as IDraggableCatalogListItem).item;
        if (cacheItem) {
            props.onFilterItemDropped(cacheItem);
        }
    },

    canDrop(props: Partial<IFilterBarDropTargetProps>, monitor: DropTargetMonitor): boolean {
        const cacheItem: ICatalogEntry = (monitor.getItem() as IDraggableCatalogListItem).item;
        if (cacheItem) {
            return props.itemIsAllowedToDrop(cacheItem.identifier, cacheItem.type);
        }
        return false;
    },
};
