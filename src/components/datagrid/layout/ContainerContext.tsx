import {createContext, type RefObject} from "react";

type ContainerContextType = {
    resizable: boolean,
    containerRef?: RefObject<HTMLElement | null>,
    height?: number,
    width?: number,
}
export const containerContext: ContainerContextType = {
    resizable: false,
}
export const ContainerContext = createContext<ContainerContextType>(containerContext);