// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { TextAreaWithSubmit } from "@gooddata/sdk-ui-kit";

interface IInsightDescriptionProps {
    description: string;
    setDescription: (newDescription: string) => void;
}

export function InsightDescription(props: IInsightDescriptionProps) {
    const { description, setDescription } = props;

    const intl = useIntl();

    const onChange = (value: string): void => {
        setDescription(value.trim());
    };

    return (
        <label className="gd-input">
            <TextAreaWithSubmit
                className={cx("gd-input-field description gd-widget-description-input")}
                rows={4}
                defaultValue={(description || "").trim()}
                maxLength={2000}
                placeholder={intl.formatMessage({
                    id: "configurationPanel.visualprops.descriptionPlaceholder",
                })}
                onSubmit={onChange}
            />
        </label>
    );
}
