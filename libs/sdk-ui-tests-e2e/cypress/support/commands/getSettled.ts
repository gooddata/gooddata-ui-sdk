// (C) 2021 GoodData Corporation

type SettleOptions = {
    retries?: number;
    delay?: number;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Chainable<Subject> {
            settled: (selector: string, opts?: SettleOptions) => Chainable<Subject>;
        }
    }
}

export default {};

// recursively gets an element, returning only after it's determined to be attached to the DOM for good
Cypress.Commands.add(
    "settled",
    { prevSubject: true },
    (subject: JQuery, selector: string, opts: SettleOptions = {}) => {
        const retries = opts.retries || 3;
        const delay = opts.delay || 100;

        const isAttached = (resolve: any, count = 0) => {
            const el = subject.find(selector);
            // is element attached to the DOM?
            count = Cypress.dom.isAttached(el) ? count + 1 : 0;
            // hit our base case, return the element
            if (count >= retries) {
                return resolve(el);
            }
            // retry after a bit of a delay
            setTimeout(() => isAttached(resolve, count), delay);
        };

        // wrap, so we can chain cypress commands off the result
        return cy.wrap(null).then(() => {
            return new Cypress.Promise((resolve) => {
                return isAttached(resolve, 0);
            }).then((el) => {
                return cy.wrap(el);
            });
        });
    },
);
