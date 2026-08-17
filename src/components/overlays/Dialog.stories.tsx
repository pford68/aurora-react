import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import Dialog from "./Dialog.tsx";
import styles from "../../stories/css/Popup.stories.module.css"
import {useState} from "react";


type PropsAndArgs = React.ComponentProps<typeof Dialog> & {
    width: number,
    height: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "overlays/Dialog",
    component: Dialog,
    args: {
        width: 800,
        height: 300,
        className: styles.popup,
        title: "Settings",
        visible: false,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    const [visible, setVisible] = useState(args.visible);
    return (
        <>
            <Dialog {...props} visible={visible} onClose={() => setVisible(false)}>
                <div>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s,
                    when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                    It has survived not only five centuries, but also the leap into electronic typesetting,
                    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
                    sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                </div>
            </Dialog>
            <div onClick={() => setVisible(!visible)}>Open</div>
            <button
                onClick={() => alert("Hi!")}
                style={{position: "absolute", top: "300px"}}
            >Click me</button>
        </>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




