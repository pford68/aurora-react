import {type RefObject, useEffect, useState } from "react";

const useInView = <T extends Element>(
    target: RefObject<T>,
    options: IntersectionObserverInit = {}
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            setIsIntersecting(entries[0].isIntersecting);
        };

        let observer:IntersectionObserver | null;
        if (target.current) {
            observer = new IntersectionObserver(handleIntersect, options);
            observer.observe(target.current);
        }

        return () => observer?.disconnect();
    }, [target.current, options.root, options.rootMargin, options.threshold]);


    return isIntersecting;
};

export default useInView;