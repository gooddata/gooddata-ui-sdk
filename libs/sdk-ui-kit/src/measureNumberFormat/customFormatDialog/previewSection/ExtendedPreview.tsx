// (C) 2020-2025 GoodData Corporation
import { useState } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { ISeparators } from "@gooddata/sdk-ui";

import PreviewRows from "../shared/PreviewRows.js";

interface IExtendedPreviewProps {
    format: string;
    separators?: ISeparators;
}

export function ExtendedPreview({ format, separators }: IExtendedPreviewProps) {
    const [expanded, setExpanded] = useState<boolean>(false);

    const openExtendedPreview = (): void => {
        setExpanded(true);
    };

    return (
        <div className="gd-measure-format-extended-preview s-custom-format-dialog-extended-preview">
            <div
                className={cx("s-custom-format-dialog-extended-preview-button gd-measure-format-button", {
                    hidden: expanded,
                })}
                onClick={openExtendedPreview}
            >
                <div className="gd-icon-navigateright gd-measure-format-button-icon-left" />
                <span>
                    <FormattedMessage id="measureNumberCustomFormatDialog.extendedPreview.button" />
                </span>
            </div>
            {expanded ? <PreviewRows format={format} separators={separators} /> : null}
        </div>
    );
}
