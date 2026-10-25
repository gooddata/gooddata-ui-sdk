// (C) 2007-2026 GoodData Corporation

import { type ElementType, type ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { FACT } from "../../constants/bucket.js";
import { shortenText } from "../../utils/base.js";

const MAX_TITLE_LENGTH = 45;

export interface IShortcutTitleProps {
    translationKey: string;
    title?: string;
    itemType?: string;
    tagName?: ElementType;
}

export function ShortcutTitle({
    tagName = "p",
    title = "",
    itemType = null,
    translationKey,
}: IShortcutTitleProps) {
    const intl = useIntl();
    const getDecoratedTitle = () => {
        let decoratedTitle = title;
        if (itemType === FACT) {
            decoratedTitle = intl.formatMessage(
                {
                    id: "aggregations.metric_title.sum",
                },
                { title: decoratedTitle },
            );
        }

        return shortenText(decoratedTitle, {
            maxLength: MAX_TITLE_LENGTH,
        });
    };

    const intlProps = {
        id: translationKey,
        tagName: tagName,
        values: {
            br: <br />,
            strong: (chunks: ReactNode[]) => <strong>{chunks}</strong>,
            ...(title
                ? {
                      decoratedTitle: getDecoratedTitle(),
                  }
                : {}),
        },
    };

    return <FormattedMessage {...intlProps} />;
}
