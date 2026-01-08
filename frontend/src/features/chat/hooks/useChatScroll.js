import { useEffect, useRef } from 'react';

export const useChatScroll = (dependency) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [dependency]);

    return scrollRef;
};