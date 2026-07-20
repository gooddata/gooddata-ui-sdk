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

import { AsCodeCreateDialog } from "../asCode/AsCodeCreateDialog.js";
import { getAsCodeDescriptor } from "../asCodeRegistry.js";
import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { ObjectTypes } from "../objectType/constants.js";
import { getObjectTypeLabel } from "../objectType/labels.js";
import type { CatalogCreateObjectType } from "../objectType/types.js";

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
    // The type whose create dialog is open, or undefined when none is. One state for every as-code
    // type, since they all open the same generic dialog.
    const [openType, setOpenType] = useState<CatalogCreateObjectType | undefined>(undefined);

    // The types created inline in a catalog dialog (the rest redirect to a standalone editor).
    const inCatalogTypes = useMemo(() => {
        const types = new Set<CatalogCreateObjectType>();
        if (showMetricEditor) {
            types.add(ObjectTypes.METRIC);
        }
        if (showParameter) {
            types.add(ObjectTypes.PARAMETER);
        }
        return types;
    }, [showMetricEditor, showParameter]);

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
        const inCatalogItems = [...inCatalogTypes].map((type) => interactiveItem(type, false));

        if (inCatalogItems.length === 0) {
            return redirectItems;
        }
        return [
            ...redirectItems,
            { type: "static", data: <SeparatorLine pT={5} pR={10} pB={4} pL={10} /> },
            ...inCatalogItems,
        ];
    }, [intl, inCatalogTypes, showMetricEditor]);

    const handleSelect = useCallback(
        (item: IUiMenuInteractiveItem<CreateItemData>, _event: MouseEvent | KeyboardEvent) => {
            if (inCatalogTypes.has(item.data)) {
                setOpenType(item.data);
            } else {
                onCreateObject(item.data);
            }
        },
        [inCatalogTypes, onCreateObject],
    );

    const closeDialog = useCallback(() => setOpenType(undefined), []);

    const handleCreated = useCallback(() => {
        if (openType) {
            void refetchObjectType(openType);
        }
    }, [openType, refetchObjectType]);

    const openDescriptor = openType ? getAsCodeDescriptor(openType) : undefined;

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
            {openDescriptor ? (
                <AsCodeCreateDialog
                    key={openDescriptor.objectType}
                    descriptor={openDescriptor}
                    onClose={closeDialog}
                    onCreated={handleCreated}
                />
            ) : null}
        </>
    );
}

function MenuItemIcon({ type }: { type: IconType }) {
    return <UiIcon type={type} size={14} color="complementary-5" />;
}
