import invariant from 'invariant';
import { find, every } from 'lodash';

export default class Rules {
    constructor() {
        this.rules = [];
    }

    addRule(tests, callback) {
        this.rules.push([tests, callback]);
    }

    match(subject) {
        const [, callback] = find(this.rules, ([tests]) => every(tests, test => test(subject)));

        invariant(callback, 'Callback not found :-(');

        return callback;
    }
}
