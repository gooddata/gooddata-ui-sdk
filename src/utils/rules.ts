import * as invariant from 'invariant';
import { find, every } from 'lodash';

export class Rules {
    private rules: any[];

    constructor() {
        this.rules = [];
    }

    public addRule(tests: Function[], callback: Function) {
        this.rules.push([tests, callback]);
    }

    public match(subject: any, params: any) {
        const [, callback] = find(this.rules, ([tests]) => every(tests, test => test(subject, params)));

        invariant(callback, 'Callback not found :-(');

        return callback;
    }
}
