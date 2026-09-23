import {type ReactElement, type RefObject, useEffect, useState} from "react";
import {joinCss} from "../../util/utils.ts";
import styles from "./overlays.module.css";
import Menu from "./Menu.tsx";


type ContextMenuProps = {
    items: ReactElement[],
    targetRef: RefObject<HTMLElement | null>,
    className?: string,
}


export default function ContextMenu(props: ContextMenuProps): ReactElement {
    const {
        items,
        targetRef,
        className,
    } = props;
    const [state, setState] = useState({visible: false, top: 0, left:0 });

    useEffect(() => {
        const onBodyClick = () => {
            setState(prev => ({ ...prev, visible: false }));
        };

        document.body?.addEventListener("click", onBodyClick);
        return () => {
            document.body?.removeEventListener("click", onBodyClick);
        };
    }, []);


    useEffect(() => {
        const onContextMenu = (e: MouseEvent):void => {
            e.preventDefault();
            e.stopPropagation();  // Allows nested menus

            setState((prev => {
                return {
                    visible: !prev.visible,
                    top: e.clientY,
                    left: e.clientX,
                }
            }));
        }

        const target = targetRef.current;
        if (target != null) {
            target.addEventListener("contextmenu", onContextMenu);
        }

        return () => {
            if (target != null) {
                target.removeEventListener("contextmenu", onContextMenu)
            }
        }
    }, [targetRef]);

    if (state.visible) {
        return (
            <Menu
                visible={state.visible}
                top={state.top}
                left={state.left}
                className={joinCss(styles.contextmenu, className)}
                onClick={() => setState({...state, visible: false})}
            >
                {items}
            </Menu>
        );
    }

    return <></>;
}
