// (C) 2023-2025 GoodData Corporation
import React, { ComponentType } from "react";
import { wrapDisplayName } from "@gooddata/sdk-ui";

import { IBaseHeadlineTitle, IWithTitleProps } from "../../../interfaces/BaseHeadlines.js";

export const withTitle = <T, H extends IBaseHeadlineTitle>(
    BaseHeadlineDataItem: ComponentType<T>,
): React.ComponentType<T & IWithTitleProps<H>> => {
    const WithTitle: React.FC<T & IWithTitleProps<H>> = (props) => {
        const { shouldHideTitle, titleRef, dataItem } = props;
        return (
            <>
                <BaseHeadlineDataItem {...props} />
                {shouldHideTitle ? null : (
                    <div
                        className="headline-title-wrapper s-headline-title-wrapper"
                        title={dataItem?.title}
                        ref={titleRef}
                    >
                        {dataItem?.title}
                    </div>
                )}
            </>
        );
    };

    return wrapDisplayName("withTitle", BaseHeadlineDataItem)(WithTitle);
};
