// (C) 2021-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { debounce } from "lodash-es";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { InputPure } from "@gooddata/sdk-ui-kit";

import { visualizationPropertiesChanged } from "../../actions/properties_actions.js";
import { VisualizationPropertiesSelectors } from "../../selectors/visualization_properties_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

export interface IAttributeBucketItemHyperlinkConfigurationProps {
    localIdentifier: string;
}

export function AttributeBucketItemHyperlinkConfiguration({
    localIdentifier,
}: IAttributeBucketItemHyperlinkConfigurationProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const visualizationProperties = useSelector((state: IAppState) =>
        VisualizationPropertiesSelectors.getProperties(state),
    );

    const visPropertiesJS = visualizationProperties;
    const savedHyperLinkText = visPropertiesJS?.["hyperLinks"]?.[localIdentifier]?.staticElementsText;
    const [hyperlinkStaticText, setHyperlinkStaticText] = useState(savedHyperLinkText ?? "");

    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const debouncedPropertiesChange = useCallback(
        debounce((...args: Parameters<typeof visualizationPropertiesChanged>) => {
            dispatch(visualizationPropertiesChanged(...args));
        }, 500),
        [dispatch],
    );

    return (
        <>
            <span className="adi-attribute-hyperlink-static-text-label">
                {intl.formatMessage({ id: "dashboard.bucket_item.hyperlink_text" })}
            </span>
            <InputPure
                className="adi-attribute-hyperlink-static-text s-attribute-configuration-hyperlink-static-text"
                value={hyperlinkStaticText}
                onChange={(text) => {
                    setHyperlinkStaticText(text as string);
                    debouncedPropertiesChange(
                        {
                            hyperLinks: {
                                [localIdentifier]: {
                                    staticElementsText: text,
                                },
                            },
                        },
                        true,
                    );
                }}
                isSmall
                autofocus
            />
        </>
    );
}
