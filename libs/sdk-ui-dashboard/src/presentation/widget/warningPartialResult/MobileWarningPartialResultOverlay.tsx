// (C) 2022-2024 GoodData Corporation
import React, { ReactNode } from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

interface IMobileWarningPartialResultOverlayProps {
    percentage: string;
    isExportRawInNewUiVisible: boolean;
    onClose: () => void;
    onExportRawCSV: () => void;
}

export const MobileWarningPartialResultOverlay: React.FC<IMobileWarningPartialResultOverlayProps> = ({
    percentage,
    isExportRawInNewUiVisible,
    onClose,
    onExportRawCSV,
}) => {
    return (
        <div className="gd-warning-partial-result-content-mobile">
            <div className="gd-warning-partial-result-mobile">
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
                    onClick={onClose}
                />
            </div>
        </div>
    );
};
