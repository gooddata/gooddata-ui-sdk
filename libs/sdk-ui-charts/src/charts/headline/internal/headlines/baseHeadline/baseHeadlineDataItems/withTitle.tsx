// (C) 2023 GoodData Corporation
import React, { ComponentType } from "react";
import { wrapDisplayName } from "@gooddata/sdk-ui";

import { IWithTitleProps } from "../../../interfaces/BaseHeadlines.js";

export const withTitle = <T,>(
    BaseHeadlineDataItem: ComponentType<T>,
): React.ComponentType<T & IWithTitleProps> => {
    const WithTitle: React.FC<T & IWithTitleProps> = (props) => {
        const { shouldHideTitle, titleRef, dataItem } = props;
        return (
            <>
                <BaseHeadlineDataItem {...props} />
                {!shouldHideTitle ? (
                    <div
                        className="headline-title-wrapper s-headline-title-wrapper"
                        title={dataItem?.title}
                        ref={titleRef}
                    >
                        {dataItem?.title}
                    </div>
                ) : null}
            </>
        );
    };

    return wrapDisplayName("withTitle", BaseHeadlineDataItem)(WithTitle);
};
