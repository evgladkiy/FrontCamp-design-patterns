// (sd): export should not be default
// checkout lodash version?
export function throttle(func, ms) {
    let isThrottled = false;
    let savedArgs;
    let savedThis;

    function wrapper(...rest) {
        if (isThrottled) {
            savedArgs = rest;
            savedThis = this;
            return;
        }

        func.apply(this, rest);

        isThrottled = true;

        setTimeout(() => {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = null;
                savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}
