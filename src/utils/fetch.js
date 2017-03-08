import invariant from 'invariant';

let realFetch;

export function setFetch(fetch) {
    realFetch = fetch;
}

export default function(url, options) {
    invariant(realFetch, 'You have to define fetch implementation' +
        '(node-fetch, isomorphic-fetch) before using it.');

    return realFetch(url, options);
}
