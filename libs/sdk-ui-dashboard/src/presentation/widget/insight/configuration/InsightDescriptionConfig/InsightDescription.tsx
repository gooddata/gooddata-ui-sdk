// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

interface IInsightDescriptionProps {
    description: string;
    setDescription: (newDescription: string) => void;
}

export function InsightDescription(props: IInsightDescriptionProps) {
    const { description, setDescription } = props;

    const intl = useIntl();

    const omitPlaceholder = description?.length > 0;

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setDescription(e.target.value);
    };

    return (
        <label className="gd-input">
            <textarea
                className="gd-input-field description"
                maxLength={2000}
                placeholder={
                    omitPlaceholder
                        ? undefined
                        : intl.formatMessage({ id: "configurationPanel.visualprops.descriptionPlaceholder" })
                }
                value={description}
                rows={4}
                onChange={onChange}
            />
        </label>
    );
}
