import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import Overlay from "../components/overlays/Overlay.tsx";
import styles from "./css/Popup.stories.module.css"


type PropsAndArgs = React.ComponentProps<typeof Overlay> & {
    width: number,
    height: number,
    top: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "overlays/Overlay",
    component: Overlay,
    args: {
        visible: true,
        top: 10,
        left: 50,
        width: 100,
        className: styles.popup,
        noContextMenu: true,
        center: false,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


const defaultRenderer = (args: PropsAndArgs) => {
    const {visible, noContextMenu, center} = args
    const {width, left, top} = args;
    return (
        <Overlay visible={visible} noContextMenu={noContextMenu} center={center}>
            <div style={{
                width,
                height: "max-content",
                border: "solid silver 1px",
                position: "relative",
                left: `${left}px`,
                top: `${top}px`
            }}>
                This is a popup.  This is the base component for dropdowns and menus.
            </div>
        </Overlay>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




