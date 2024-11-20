// (C) 2022-2024 GoodData Corporation
import React, { ReactNode, useEffect, useState } from "react";
import { IResultWarning } from "@gooddata/sdk-model";
import { Button, DialogBase, useMediaQuery } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { FormattedMessage } from "react-intl";
import { IExecutionResultEnvelope, uiActions, useDashboardDispatch } from "../../../model/index.js";
import { MobileWarningPartialResultOverlay } from "./MobileWarningPartialResultOverlay.js";
import { VisType } from "@gooddata/sdk-ui";

interface IInsightWidgetWarningPartialResultProps {
    className: string;
    partialResultWarning: IResultWarning[];
    isOverlayOpen: boolean;
    shouldPreserveCloseStatus: boolean;
    isExportRawInNewUiVisible: boolean;
    executionResult: IExecutionResultEnvelope;
    visualizationType: VisType;
    fingerprint?: string;
    isLoading?: boolean;

    onExportRawCSV: () => void;
}

export const InsightWidgetWarningPartialResult: React.FC<IInsightWidgetWarningPartialResultProps> = ({
    className,
    partialResultWarning,
    fingerprint,
    isOverlayOpen,
    shouldPreserveCloseStatus,
    isLoading,
    isExportRawInNewUiVisible,
    visualizationType,
    executionResult,
    onExportRawCSV,
}) => {
    const dispatch = useDashboardDispatch();
    const isMobile = useMediaQuery("mobileDevice");

    const [percentage, setPercentage] = useState<string>("");

    useEffect(() => {
        const getPercentage = async () => {
            const dataView = await executionResult.executionResult?.readAll();

            if (dataView) {
                const maxCount = Math.max(...dataView.count);

                setPercentage(Math.round((10000 / maxCount) * 100).toString());
            }
        };

        if (visualizationType === "table") {
            setPercentage(partialResultWarning[0].parameters![0] as string);
        } else {
            getPercentage();
        }
    }, [visualizationType, executionResult, partialResultWarning]);

    const [isOpen, setIsOpen] = useState<boolean>(true);

    const handleCloseOverlay = () => {
        if (shouldPreserveCloseStatus) {
            dispatch(uiActions.closePartialResultWarning(fingerprint!));
        } else {
            setIsOpen(false);
        }
    };

    const isWarningPartialResultOpen = shouldPreserveCloseStatus ? isOverlayOpen : isOpen;

    return (
        <>
            {isWarningPartialResultOpen && !isLoading ? (
                <DialogBase className={className} onMouseUp={noop} submitOnEnterKey={false}>
                    {isMobile ? (
                        <MobileWarningPartialResultOverlay
                            percentage={percentage}
                            onClose={handleCloseOverlay}
                            isExportRawInNewUiVisible={isExportRawInNewUiVisible}
                            onExportRawCSV={onExportRawCSV}
                        />
                    ) : (
                        <div className="gd-partial-result-warning">
                            <div className="gd-warning-partial-result-icon gd-icon-warning" />
                            <div className="gd-warning-partial-result-message">
                                <FormattedMessage
                                    id="warning.partial.result"
                                    values={{
                                        value: percentage,
                                        b: (chunks: ReactNode) => <strong>{chunks}</strong>,
                                        a: (chunk: ReactNode) => {
                                            if (isExportRawInNewUiVisible) {
                                                return <a onClick={onExportRawCSV}>{chunk}</a>;
                                            }
                                            return null;
                                        },
                                    }}
                                />
                            </div>
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-cross gd-warning-partial-result-close"
                                onClick={handleCloseOverlay}
                            />
                        </div>
                    )}
                </DialogBase>
            ) : null}
        </>
    );
};
