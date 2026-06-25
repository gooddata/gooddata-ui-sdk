// (C) 2026 GoodData Corporation

import { type ReactElement, type RefObject, useId, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { olpPermissionMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { type IUiLabelsChecklistItem, UiLabelsChecklist } from "../UiLabelsChecklist/UiLabelsChecklist.js";
import { type IUiMenuItem } from "../UiMenu/types.js";
import { UiMenu } from "../UiMenu/UiMenu.js";
import { UiPopover } from "../UiPopover/UiPopover.js";

const { b } = bem("gd-ui-kit-more-options-menu");

/**
 * @internal
 */
export interface IUiMoreOptionsMenuProps {
    /** Empty/omitted hides the "Manage labels access" row (e.g. facts have no labels). */
    labels?: ReadonlyArray<IUiLabelsChecklistItem>;
    /** Locked items are always treated as selected. */
    selectedLabelIds?: ReadonlyArray<string>;
    onLabelsChange?: (selectedIds: string[]) => void;
    /** Omit to hide the row (Transfer ownership is gated until wired). */
    onTransferOwnership?: () => void;
    /**
     * Omit to hide the row. Used for read-only permission rows (e.g. EDIT), whose
     * level control has no dropdown to host Remove access — so the action lives here.
     */
    onRemoveAccess?: () => void;
    isDisabled?: boolean;
    dataTestId?: string;
}

type MoreOptionsMenuData = {
    interactive: undefined;
    content: undefined;
};

type LabelsContentData = {
    labels: ReadonlyArray<IUiLabelsChecklistItem>;
    selectedLabelIds: ReadonlyArray<string>;
    onLabelsChange?: (selectedIds: string[]) => void;
    dataTestId?: string;
};

type ContentComponent = (props: { onBack: () => void; onClose: () => void }) => ReactElement;

interface ILabelsContentProps {
    onBack: () => void;
    onClose: () => void;
    dataRef: RefObject<LabelsContentData>;
}

// Defined at module scope, and reading data through a ref, so its identity never
// changes across renders — UiMenu remounts the drill-in on a new component type,
// which would drop the checklist's staged edits.
function LabelsChecklistContent({ onBack, onClose, dataRef }: ILabelsContentProps) {
    const data = dataRef.current;
    return (
        <UiLabelsChecklist
            items={data.labels}
            defaultSelectedIds={data.selectedLabelIds}
            onApply={(ids) => data.onLabelsChange?.(ids)}
            onBack={onBack}
            onClose={onClose}
            dataTestId={data.dataTestId}
        />
    );
}

/**
 * Per-grantee "⋯" menu: "Manage labels access" (drills into {@link UiLabelsChecklist}),
 * "Transfer ownership" and "Remove access". Each row shows only when its data/handler
 * is given. Remove access appears here for read-only permission rows whose level control
 * has no dropdown to host it.
 *
 * @internal
 */
export function UiMoreOptionsMenu({
    labels,
    selectedLabelIds,
    onLabelsChange,
    onTransferOwnership,
    onRemoveAccess,
    isDisabled,
    dataTestId,
}: IUiMoreOptionsMenuProps) {
    const intl = useIntl();
    const menuId = useId();

    const hasLabels = (labels?.length ?? 0) > 0;

    // Feed the live inputs to the stable content component through a ref so the
    // component itself never has to change (see LabelsChecklistContent).
    const dataRef = useRef<LabelsContentData>({
        labels: labels ?? [],
        selectedLabelIds: selectedLabelIds ?? [],
        onLabelsChange,
        dataTestId,
    });
    dataRef.current = {
        labels: labels ?? [],
        selectedLabelIds: selectedLabelIds ?? [],
        onLabelsChange,
        dataTestId,
    };

    const labelsContentRef = useRef<ContentComponent>(undefined);
    if (!labelsContentRef.current) {
        labelsContentRef.current = (props) => <LabelsChecklistContent {...props} dataRef={dataRef} />;
    }

    const items = useMemo<IUiMenuItem<MoreOptionsMenuData>[]>(() => {
        const result: IUiMenuItem<MoreOptionsMenuData>[] = [];
        if (hasLabels) {
            result.push({
                type: "content",
                id: "labels",
                stringTitle: intl.formatMessage(olpPermissionMessages.labels),
                showComponentOnly: true,
                // UiMenu adds the trailing drill-in chevron itself; we only set the leading icon.
                iconLeft: <UiIcon type="ldmLabel" size={16} color="complementary-7" />,
                data: undefined,
                Component: labelsContentRef.current!,
            });
        }
        if (onTransferOwnership) {
            result.push({
                type: "interactive",
                id: "transfer",
                stringTitle: intl.formatMessage(olpPermissionMessages.transferOwnership),
                iconLeft: <UiIcon type="sync" size={16} color="complementary-7" />,
                data: undefined,
            });
        }
        if (onRemoveAccess) {
            result.push({
                type: "interactive",
                id: "remove",
                stringTitle: intl.formatMessage(olpPermissionMessages.removeAccess),
                iconLeft: <UiIcon type="trash" size={16} color="complementary-7" />,
                data: undefined,
            });
        }
        return result;
    }, [hasLabels, onTransferOwnership, onRemoveAccess, intl]);

    return (
        <UiPopover
            anchor={
                <UiIconButton
                    icon="ellipsis"
                    variant="tertiary"
                    size="large"
                    iconColor="complementary-6"
                    isDisabled={isDisabled}
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage(olpPermissionMessages.moreOptionsAriaLabel),
                    }}
                />
            }
            anchorAccessibilityConfig={{ ariaHaspopup: "menu" }}
            width={200}
            content={({ onClose }) => (
                <div className={b()} data-testid={dataTestId}>
                    <UiMenu<MoreOptionsMenuData>
                        items={items}
                        size="small"
                        onSelect={(item) => {
                            if (item.id === "transfer") {
                                onTransferOwnership?.();
                            } else if (item.id === "remove") {
                                onRemoveAccess?.();
                            }
                        }}
                        onClose={onClose}
                        ariaAttributes={{
                            id: menuId,
                            "aria-label": intl.formatMessage(olpPermissionMessages.moreOptionsMenuLabel),
                        }}
                    />
                </div>
            )}
        />
    );
}
