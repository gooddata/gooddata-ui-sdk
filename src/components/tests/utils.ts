// (C) 2007-2018 GoodData Corporation
function delay(timeout = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

export {
    delay
};
