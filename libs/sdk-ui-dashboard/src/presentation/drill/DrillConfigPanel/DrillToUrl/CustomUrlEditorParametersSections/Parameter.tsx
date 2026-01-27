// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useState } from "react";

import classNames from "classnames";
import { type IntlShape } from "react-intl";

import { Bubble, Button } from "@gooddata/sdk-ui-kit";
import { isDarkTheme, useTheme } from "@gooddata/sdk-ui-theme-provider";
import { simplifyText } from "@gooddata/util";

interface IParameterProps {
    name: string;
    description?: string;
    detailContent: ReactElement;
    iconClassName: string;
    onAdd: () => void;
    intl: IntlShape;
}

export function Parameter({ name, description, detailContent, iconClassName, onAdd, intl }: IParameterProps) {
    const [displayHelp, setDisplayHelp] = useState(false);
    const theme = useTheme();
    const isDark = theme && isDarkTheme(theme);

    const descriptionSuffix = description ? simplifyText("_" + description) : "";
    const id = simplifyText(name) + descriptionSuffix;
    const itemClassNames = classNames("gd-list-item gd-menu-item", `s-parameter-${id}`, iconClassName);
    const addButtonLabel = intl.formatMessage({
        id: "configurationPanel.drillIntoUrl.editor.addParameterButtonLabel",
    });
    return (
        <div id={id} className={itemClassNames} onClick={() => onAdd()}>
            <span className="gd-parameter-title">{name}</span>
            {description ? <span className="addon s-parameter-description">({description})</span> : null}
            <Button className="gd-button gd-button-link s-parameter-add-button" value={addButtonLabel} />
            <div className="gd-list-item-tooltip">
                <span
                    className="gd-icon-circle-question gd-list-item-tooltip-icon s-parameter-help-icon"
                    onMouseEnter={() => setDisplayHelp(true)}
                    onMouseLeave={() => setDisplayHelp(false)}
                />
                {displayHelp ? (
                    <Bubble
                        className={`themed-bubble ${isDark ? "bubble-primary" : "bubble-light"}`}
                        alignTo={`#${id}`}
                        alignPoints={[{ align: "cr tl" }]}
                    >
                        {detailContent}
                    </Bubble>
                ) : null}
            </div>
        </div>
    );
}
