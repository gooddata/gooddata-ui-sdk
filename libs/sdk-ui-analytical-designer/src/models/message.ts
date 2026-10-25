// (C) 2007-2026 GoodData Corporation

export interface IMessage {
    id: string;
    type: string;
    text: string;
    node?: string | null;
    values?: Record<string, string> | null;
    errorDetails?: {
        id: string;
        values: Record<string, string>;
    } | null;
    errorDetail?: string | null;
    timeoutId?: number | null;
    showLess?: string | null;
    showMore?: string | null;
}

// Every key present; unset fields hold null.
const messageDefaults: IMessage = {
    id: null,
    type: null,
    text: null,
    node: null,
    values: null,
    errorDetails: null,
    timeoutId: null,
    showMore: null,
    showLess: null,
    errorDetail: null,
};

export function newMessage(props: Partial<IMessage>): IMessage {
    // like the former Record constructor, a prop passed as undefined keeps its (null) default
    const definedProps = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined));
    return { ...messageDefaults, ...definedProps };
}
