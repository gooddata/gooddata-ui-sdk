// (C) 2025 GoodData Corporation

import { useId } from "react";

import cx from "classnames";

import { ErrorComponent } from "@gooddata/sdk-ui";
import { Dialog, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { KdaDialogSections } from "./KdaDialogSections.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../presentation/constants/index.js";
import { KdaContent } from "../components/KdaContent.js";
import { KdaFooter } from "../components/KdaFooter.js";
import { KdaHeader } from "../components/KdaHeader.js";
import { FiltersBar } from "../composition/FiltersBar.js";
import { KeyDriversFooter } from "../composition/KeyDriversFooter.js";
import { KeyDriversOverview } from "../composition/KeyDriversOverview.js";
import { KeyDriversPanel } from "../composition/KeyDriversPanel.js";
import { MetricsBar } from "../composition/MetricsBar.js";
import { IKdaDialogProps } from "../types.js";
import { useKdaDialogAccessibility } from "./hooks/useKdaDialogAccessibility.js";
import { useKdaState } from "../providers/KdaState.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

/**
 * @internal
 */
export function KdaDialog({ className, showCloseButton = true, onClose }: IKdaDialogProps) {
    const { state } = useKdaState();
    const accessibilityConfig = useKdaDialogAccessibility(state.metric?.title ?? "");
    const detailsId = useId();

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <Dialog
                className={cx(accessibilityConfig.dialogId, className)}
                isModal={accessibilityConfig.isModal}
                accessibilityConfig={accessibilityConfig}
                displayCloseButton={showCloseButton}
                closeOnEscape={showCloseButton}
                onClose={onClose}
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
                            leftContent={<KeyDriversPanel detailsId={detailsId} />}
                            leftLoader={<KeyDriversPanel detailsId={detailsId} loading={true} />}
                            leftError={
                                <ErrorComponent
                                    message="Unknown error"
                                    description="Can not load key drivers attributes list. Please try again later."
                                />
                            }
                            rightContent={<KeyDriversOverview detailsId={detailsId} />}
                            rightLoader={<KeyDriversOverview loading={true} />}
                            rightError={
                                <ErrorComponent
                                    message="Unknown error"
                                    description="Can not load key driver details. Please try again later."
                                />
                            }
                        />
                    }
                    footer={<KdaFooter content={<KeyDriversFooter />} onClose={onClose} />}
                />
            </Dialog>
        </OverlayControllerProvider>
    );
}
