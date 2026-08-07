import type {ReactElement, ReactNode, MouseEvent} from "react";
import type {Consumer} from "../../types/types.ts";
import Overlay from "./Overlay.tsx";
import styles from "./overlays.module.css";
import {joinCss} from "../../util/utils.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type DialogProps = {
    visible: boolean,
    children: ReactElement,
    onClose: Consumer<MouseEvent>,
    title?: ReactNode,
    className?: string,
    titleClass?: string,
    contentClass?: string,
}

export default function Dialog(props: DialogProps): ReactNode {
   const {
       children,
       visible,
       className,
       title,
       titleClass,
       contentClass,
       onClose,
   } = props;

   return (
       <Overlay
           visible={visible}
           center
           modal
           noContextMenu
       >
           <div role="dialog" className={joinCss(styles.dialog, styles.popup, className)}>
               <div className={styles.titlebar}>
                   <span className={styles.corner}></span>
                   <span className={joinCss(styles.title, titleClass)}>{title}</span>
                   <span
                       className={joinCss(styles.corner, styles.control)}
                       onClick={onClose}
                   >
                       <FontAwesomeIcon icon="xmark" />
                   </span>
               </div>
               <div className={joinCss(styles.content, contentClass)}>
                    {children}
               </div>
           </div>
       </Overlay>
   )
}