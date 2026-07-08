// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import {
    Dropdown,
    type IUiMenuInteractiveItem,
    type IUiMenuItem,
    type IconType,
    SeparatorLine,
    UiButton,
    UiIcon,
    UiMenu,
} from "@gooddata/sdk-ui-kit";

import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { MetricCreateDialog } from "../metric/MetricCreateDialog.js";
import { ObjectTypes } from "../objectType/constants.js";
import { getObjectTypeLabel } from "../objectType/labels.js";
import type { CatalogCreateObjectType } from "../objectType/types.js";
import { ParameterCreateDialog } from "../parameter/ParameterCreateDialog.js";

type CreateItemData = {
    interactive: CatalogCreateObjectType;
    static: unknown;
};

const icons: Record<CatalogCreateObjectType, IconType> = {
    [ObjectTypes.DASHBOARD]: "dashboard",
    [ObjectTypes.VISUALIZATION]: "visualization",
    [ObjectTypes.METRIC]: "metric",
    [ObjectTypes.PARAMETER]: "parameter",
};

type Props = {
    onCreateObject: (objectType: CatalogCreateObjectType) => void;
    showParameter?: boolean;
    showMetricEditor?: boolean;
};

export function CreateObjectButton({ onCreateObject, showParameter, showMetricEditor }: Props) {
    const intl = useIntl();
    const { refetchObjectType } = useCatalogFeedActions();
    const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);
    const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);

    const items = useMemo<IUiMenuItem<CreateItemData>[]>(() => {
        const externalLinkIcon = <MenuItemIcon type="externalLink" />;
        const interactiveItem = (
            type: CatalogCreateObjectType,
            redirects: boolean,
        ): IUiMenuInteractiveItem<CreateItemData> => ({
            type: "interactive",
            id: type,
            stringTitle: getObjectTypeLabel(intl, type),
            iconLeft: <MenuItemIcon type={icons[type]} />,
            // A redirect create leaves the catalog for the standalone editor; an in-catalog create
            // opens a dialog and needs no external-link affordance.
            iconRight: redirects ? externalLinkIcon : undefined,
            data: type,
        });

        // A separator divides creates that redirect to a standalone editor from those handled inline
        // in a catalog dialog. Metric switches sides: it redirects unless its in-catalog editor is on.
        const redirectItems = [
            interactiveItem(ObjectTypes.DASHBOARD, true),
            interactiveItem(ObjectTypes.VISUALIZATION, true),
            ...(showMetricEditor ? [] : [interactiveItem(ObjectTypes.METRIC, true)]),
        ];
        const inCatalogItems = [
            ...(showMetricEditor ? [interactiveItem(ObjectTypes.METRIC, false)] : []),
            ...(showParameter ? [interactiveItem(ObjectTypes.PARAMETER, false)] : []),
        ];

        if (inCatalogItems.length === 0) {
            return redirectItems;
        }
        return [
            ...redirectItems,
            { type: "static", data: <SeparatorLine pT={5} pR={10} pB={4} pL={10} /> },
            ...inCatalogItems,
        ];
    }, [intl, showParameter, showMetricEditor]);

    const handleSelect = useCallback(
        (item: IUiMenuInteractiveItem<CreateItemData>, _event: MouseEvent | KeyboardEvent) => {
            if (item.data === ObjectTypes.PARAMETER) {
                setIsParameterDialogOpen(true);
            } else if (item.data === ObjectTypes.METRIC && showMetricEditor) {
                setIsMetricDialogOpen(true);
            } else {
                onCreateObject(item.data);
            }
        },
        [onCreateObject, showMetricEditor],
    );

    const handleParameterDialogClose = useCallback(() => {
        setIsParameterDialogOpen(false);
    }, []);

    const handleParameterCreated = useCallback(() => {
        void refetchObjectType(ObjectTypes.PARAMETER);
    }, [refetchObjectType]);

    const handleMetricDialogClose = useCallback(() => {
        setIsMetricDialogOpen(false);
    }, []);

    const handleMetricCreated = useCallback(() => {
        void refetchObjectType(ObjectTypes.METRIC);
    }, [refetchObjectType]);

    return (
        <>
            <Dropdown
                alignPoints={[{ align: "br tr" }]}
                renderButton={({ toggleDropdown, buttonRef, ariaAttributes, accessibilityConfig }) => (
                    <UiButton
                        ref={(element) => {
                            buttonRef.current = element;
                        }}
                        label={intl.formatMessage({ id: "analyticsCatalog.create" })}
                        onClick={toggleDropdown}
                        variant="primary"
                        iconBefore="plus"
                        iconAfter="navigateDown"
                        accessibilityConfig={{
                            ...accessibilityConfig,
                            ariaExpanded: ariaAttributes["aria-expanded"],
                            ariaHaspopup: ariaAttributes["aria-haspopup"],
                            ariaControls: ariaAttributes["aria-controls"],
                            iconAriaHidden: true,
                        }}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu
                        items={items}
                        minWidth={180}
                        onClose={closeDropdown}
                        onSelect={handleSelect}
                        shouldCloseOnSelect
                        ariaAttributes={ariaAttributes}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                    />
                )}
                closeOnEscape
                autofocusOnOpen
            />
            {isParameterDialogOpen ? (
                <ParameterCreateDialog
                    onClose={handleParameterDialogClose}
                    onCreated={handleParameterCreated}
                />
            ) : null}
            {isMetricDialogOpen ? (
                <MetricCreateDialog onClose={handleMetricDialogClose} onCreated={handleMetricCreated} />
            ) : null}
        </>
    );
}

function MenuItemIcon({ type }: { type: IconType }) {
    return <UiIcon type={type} size={14} color="complementary-5" />;
}
