// (C) 2020-2026 GoodData Corporation

import { memo, useCallback, useMemo, useState } from "react";

import { FormattedMessage } from "react-intl";

import { type ISeparators } from "@gooddata/sdk-ui";
import { simplifyText } from "@gooddata/util";

import { Bubble } from "../../../Bubble/Bubble.js";
import { Typography } from "../../../Typography/Typography.js";
import { type IFormatTemplate } from "../../typings.js";
import { PreviewRows } from "../shared/PreviewRows.js";

interface ITemplateDropdownItemProps {
    template: IFormatTemplate;
    separators?: ISeparators;
    onClick: (template: IFormatTemplate) => void;
}

function templateDropdownItemId(template: IFormatTemplate): string {
    return `gd-format-preset-template-${template.localIdentifier}`;
}

export const DropdownItem = memo(function DropdownItem({
    template,
    separators,
    onClick: onClickProp,
}: ITemplateDropdownItemProps) {
    const [displayHelp, setDisplayHelp] = useState(false);

    const onClick = useCallback(() => {
        onClickProp(template);
    }, [onClickProp, template]);

    const toggleHelp = useCallback(() => {
        setDisplayHelp((state) => !state);
    }, []);

    return (
        <>
            <div
                id={useMemo(() => templateDropdownItemId(template), [template])}
                className={useMemo(
                    () =>
                        `gd-list-item gd-format-preset gd-format-template s-measure-format-template-${simplifyText(
                            template.name,
                        )}`,
                    [template.name],
                )}
                onClick={onClick}
            >
                <span title={template.name} className="gd-format-preset-name gd-list-item-shortened">
                    {template.name}
                </span>
                <div
                    className="gd-format-template-help gd-icon-circle-question s-measure-format-template-help-toggle-icon"
                    onMouseEnter={toggleHelp}
                    onMouseLeave={toggleHelp}
                />
            </div>
            {displayHelp ? (
                <Bubble
                    alignTo={`#${templateDropdownItemId(template)}`}
                    className={`gd-measure-format-template-preview-bubble bubble-light s-measure-format-template-help-bubble-${simplifyText(
                        template.name,
                    )}`}
                    alignPoints={[{ align: "cr cl" }, { align: "cr bl" }, { align: "cr tl" }]}
                >
                    <Typography className="gd-measure-format-template-preview-bubble-title" tagName="h3">
                        {template.name}
                    </Typography>
                    <div
                        className={`gd-measure-format-template-preview-bubble-subtitle s-measure-format-template-help-preview-${simplifyText(
                            template.name,
                        )}`}
                    >
                        <FormattedMessage id="measureNumberCustomFormatDialog.template.preview.title" />
                    </div>
                    <PreviewRows
                        previewNumbers={[-1234567.891, -1234.567, -1.234, 0, 1.234, 1234.567, 1234567.891]}
                        format={template.format}
                        separators={separators}
                    />
                </Bubble>
            ) : null}
        </>
    );
});
