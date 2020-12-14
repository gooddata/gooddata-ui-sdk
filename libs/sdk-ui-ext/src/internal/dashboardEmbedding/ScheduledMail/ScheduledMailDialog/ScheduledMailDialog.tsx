// (C) 2019-2020 GoodData Corporation
import React, { useMemo } from "react";

import { useCurrentUser } from "../../hooks/useCurrentUser";

import {
    IScheduledMailDialogRendererOwnProps,
    ScheduledMailDialogRenderer,
} from "./ScheduledMailDialogRenderer";

export const ScheduledMailDialog: React.FC<IScheduledMailDialogRendererOwnProps> = (props) => {
    const { backend } = props;
    const { result } = useCurrentUser({ backend });
    const owner = useMemo(() => (result ? { user: result } : null), [result]);

    return owner ? <ScheduledMailDialogRenderer owner={owner} {...props} /> : null;
};
