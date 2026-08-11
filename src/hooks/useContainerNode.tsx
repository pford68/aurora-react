import {useCallback, useState} from "react";

type ContainerNodeType = {
    containerRef: (node: HTMLElement | null) => void,
    containerNode: HTMLElement | null,
}

export default function useContainerNode(): ContainerNodeType {
    const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);

    const containerRefCallback = useCallback((node: HTMLElement | null) => {
        if (node !== null) {
            setContainerNode(node); // Save the actual DOM node to state
        }
    }, []);

    return {
        containerRef: containerRefCallback,
        containerNode
    }
}