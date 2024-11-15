// (C) 2022-2024 GoodData Corporation
import React, { ReactNode, useState } from "react";
import { IResultWarning } from "@gooddata/sdk-model";
import { Button, DialogBase, useMediaQuery } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { FormattedMessage } from "react-intl";
import { uiActions, useDashboardDispatch } from "../../../model/index.js";
import { MobileWarningPartialResultOverlay } from "./MobileWarningPartialResultOverlay.js";

interface IInsightWidgetWarningPartialResultProps {
    className: string;
    partialResultWarning: IResultWarning[];
    isOverlayOpen: boolean;
    shouldPreserveCloseStatus: boolean;
    isExportRawInNewUiVisible: boolean;
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
    onExportRawCSV,
}) => {
    const dispatch = useDashboardDispatch();
    const isMobile = useMediaQuery("mobileDevice");

    const [isOpen, setIsOpen] = useState<boolean>(true);

    const percentage = partialResultWarning[0].parameters![0] as string;

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
                                    }}
                                />
                            </div>
                            {isExportRawInNewUiVisible ? (
                                <div className="gd-warning-partial-result-export">
                                    <FormattedMessage
                                        id="warning.partial.result.export"
                                        values={{
                                            a: (chunk: ReactNode) => {
                                                return <a onClick={onExportRawCSV}>{chunk}</a>;
                                            },
                                        }}
                                    />
                                </div>
                            ) : null}
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
