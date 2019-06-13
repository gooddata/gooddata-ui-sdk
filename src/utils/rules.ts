// (C) 2007-2018 GoodData Corporation
import * as invariant from "invariant";
import { find, every } from "lodash";

export type RulePredicate = (measureDefinition: any, mdObj: any) => boolean;

export type RuleCallback = (measure: any, mdObj: any, measureIndex: number, attributesMap: any) => any;

export class Rules {
    private rules: any[];

    constructor() {
        this.rules = [];
    }

    public addRule(tests: RulePredicate[], callback: RuleCallback) {
        this.rules.push([tests, callback]);
    }

    public match(subject: any, params: any) {
        const [, callback] = find(this.rules, ([tests]) => every(tests, test => test(subject, params)));

        invariant(callback, "Callback not found :-(");

        return callback;
    }
}
