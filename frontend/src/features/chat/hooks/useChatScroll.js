import { useEffect, useRef } from 'react';

export const useChatScroll = (...dependencies) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, dependencies); // Pass the array directly

    return scrollRef;
};