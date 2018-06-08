// (C) 2007-2018 GoodData Corporation
declare module '*/package.json' {
    export const name: string;
    export const version: string;
}

declare module '*.json' {
    const value: any;
    export default value;
}

declare module 'custom-event' {
    export = CustomEvent;
}

// TODO move goodstrap TypeScript declarations into goodstrap repo
// after exporting from goodstrap root index.js (not /lib/)

declare module '@gooddata/goodstrap/lib/Button/Button' {
    export default class Button extends React.Component<any, any> {

    }
}

declare module '@gooddata/goodstrap/lib/DataSource/DataSource' {
    export default class DataSource {
        constructor(makeInitialRequest: any, makePagedRequest: any, options: any);
    }
}

declare module '@gooddata/goodstrap/lib/Dropdown/Dropdown' {
    export default class Dropdown extends React.Component<any, any> {

    }

    export class DropdownButton extends React.Component<any, any> {

    }

    export class DropdownBody extends React.Component<any, any> {

    }
}

declare module '@gooddata/goodstrap/lib/List/InvertableList' {
    export default class InvertableList extends React.Component<any, any> {

    }
}

declare module '@gooddata/goodstrap/lib/List/List' {
    export default class List extends React.Component<any, any> {

    }
}

declare module '@gooddata/goodstrap/lib/ResponsiveText/ResponsiveText' {
    export default class ResponsiveText extends React.PureComponent<any> {

    }
}

declare module '@gooddata/goodstrap/lib/Bubble/Bubble' {
    export default class Bubble extends React.Component<any, any> {

    }
}

declare module '@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger' {
    export default class Bubble extends React.Component<any, any> {

    }
}
