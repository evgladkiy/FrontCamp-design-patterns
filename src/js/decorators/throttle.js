export default function throttle(ms) {
    return (target, prop, descriptor) => {
        const func = descriptor.value;
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

        descriptor.value = wrapper;

        return descriptor;
    };
}
