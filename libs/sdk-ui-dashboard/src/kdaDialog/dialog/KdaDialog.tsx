// (C) 2025-2026 GoodData Corporation

import { useId, useMemo } from "react";

import cx from "classnames";

import { Dialog, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { useKdaDialogAccessibility } from "./hooks/useKdaDialogAccessibility.js";
import { KdaDialogFloatingStatusBar } from "./KdaDialogFloatingStatusBar.js";
import { KdaDialogSections } from "./KdaDialogSections.js";
import { KdaContent } from "../components/KdaContent.js";
import { KdaFooter } from "../components/KdaFooter.js";
import { KdaHeader } from "../components/KdaHeader.js";
import { FiltersBar } from "../composition/FiltersBar.js";
import { KeyDriversFooter } from "../composition/KeyDriversFooter.js";
import { KeyDriversOverview } from "../composition/KeyDriversOverview.js";
import { KeyDriversPanel } from "../composition/KeyDriversPanel.js";
import { MetricsBar } from "../composition/MetricsBar.js";
import { KDA_DIALOG_OVERS_Z_INDEX } from "../const.js";
import { useKdaState } from "../providers/KdaState.js";
import { type IKdaDialogProps } from "../types.js";
import { useChangeAnalysis } from "./hooks/useChangeAnalysis.js";
import { useKdaDialogTooltipsOverride } from "./hooks/useKdaDialogTooltipsOverride.js";
import { useValidAttributes } from "./hooks/useValidAttributes.js";
import { KdaDialogControls } from "./KdaDialogControls.js";
import { KdaErrorComponent, KdaErrorType } from "../components/KdaErrorComponent.js";

const overlayController = OverlayController.getInstance(KDA_DIALOG_OVERS_Z_INDEX);

/**
 * @internal
 */
export function KdaDialog({ className, showCloseButton = true, onClose }: IKdaDialogProps) {
    const { state } = useKdaState();
    const { isMinimized } = state;

    const metric = state.definition?.metric.measure;
    const title = metric?.alias ?? metric?.title ?? "";
    const detailsId = useId();

    const minimizedAlignPoints = useMemo(
        () => (isMinimized ? [{ align: "tc tc", offset: { x: 0, y: 30 } }] : undefined),
        [isMinimized],
    );

    const accessibilityConfig = useKdaDialogAccessibility(title, isMinimized);

    const dialogBaseClassName = cx(accessibilityConfig.dialogId, className);
    const displayCloseButton = showCloseButton ? !isMinimized : undefined;

    useChangeAnalysis();
    useValidAttributes();
    useKdaDialogTooltipsOverride();

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            {isMinimized ? (
                <Dialog
                    className={cx(dialogBaseClassName, "gd-kda-dialog--minimized")}
                    closeOnEscape={false}
                    isModal={false}
                    alignPoints={minimizedAlignPoints}
                    accessibilityConfig={accessibilityConfig}
                    displayCloseButton={displayCloseButton}
                    onClose={onClose}
                    CloseButton={KdaDialogControls}
                >
                    <KdaDialogFloatingStatusBar
                        titleElementId={accessibilityConfig.titleElementId}
                        onClose={onClose}
                    />
                </Dialog>
            ) : (
                <Dialog
                    className={cx(dialogBaseClassName, "gd-kda-dialog--expanded")}
                    closeOnEscape={!state.attributesDropdownOpen && !state.addFilterDropdownOpen}
                    isModal
                    accessibilityConfig={accessibilityConfig}
                    displayCloseButton={displayCloseButton}
                    onClose={onClose}
                    CloseButton={KdaDialogControls}
                >
                    <KdaDialogSections
                        header={
                            <KdaHeader
                                titleId={accessibilityConfig.titleElementId}
                                title={accessibilityConfig.title}
                                bars={
                                    <>
                                        <MetricsBar />
                                        <FiltersBar />
                                    </>
                                }
                            />
                        }
                        content={
                            <KdaContent
                                contentError={(err) => (
                                    <KdaErrorComponent type={KdaErrorType.Items} error={err} />
                                )}
                                leftContent={<KeyDriversPanel detailsId={detailsId} />}
                                leftLoader={<KeyDriversPanel detailsId={detailsId} loading />}
                                rightContent={<KeyDriversOverview detailsId={detailsId} />}
                                rightLoader={<KeyDriversOverview loading />}
                                rightError={(err) => (
                                    <KdaErrorComponent type={KdaErrorType.Details} error={err} />
                                )}
                            />
                        }
                        footer={<KdaFooter content={<KeyDriversFooter />} onClose={onClose} />}
                    />
                </Dialog>
            )}
        </OverlayControllerProvider>
    );
}
