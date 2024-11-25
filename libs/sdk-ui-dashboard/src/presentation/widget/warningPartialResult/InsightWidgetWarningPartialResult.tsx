// (C) 2022-2024 GoodData Corporation
import React, { ReactNode, useEffect, useState } from "react";
import { IResultWarning } from "@gooddata/sdk-model";
import { Button, DialogBase, useMediaQuery } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { FormattedMessage } from "react-intl";
import { IExecutionResultEnvelope } from "../../../model/index.js";
import { MobileWarningPartialResultOverlay } from "./MobileWarningPartialResultOverlay.js";

interface IInsightWidgetWarningPartialResultProps {
    className: string;
    partialResultWarning: IResultWarning[];
    isExportRawInNewUiVisible: boolean;
    executionResult: IExecutionResultEnvelope;
    isLoading?: boolean;

    onExportRawCSV: () => void;
}

export const InsightWidgetWarningPartialResult: React.FC<IInsightWidgetWarningPartialResultProps> = ({
    className,
    partialResultWarning,
    isLoading,
    isExportRawInNewUiVisible,
    executionResult,
    onExportRawCSV,
}) => {
    const isMobile = useMediaQuery("mobileDevice");

    const percentage = partialResultWarning[0].parameters![0] as string;

    const [isOpen, setIsOpen] = useState<boolean>(true);

    useEffect(() => {
        setIsOpen(true);
    }, [executionResult]);

    const handleCloseOverlay = () => {
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && !isLoading ? (
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
