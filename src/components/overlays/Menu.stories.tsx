import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import Menu from "./Menu.tsx";
import styles from "../../stories/css/Popup.stories.module.css"
import {useRef, useState} from "react";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";
import MenuItem from "./MenuItem.tsx";


type PropsAndArgs = React.ComponentProps<typeof Menu> & {
    width: number,
    height: number,
    left: number,
    top: number,
    bottom: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "overlays/Menu",
    component: Menu,
    args: {
        width: 800,
        height: 300,
        left: 50,
        top: 50,
        className: styles.popup,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;

const commands = [
    {
        icon: "file",
        name: "File",
        accelerator:  "⌘+f",
        execute: (e: React.MouseEvent) => {
           console.log(e.target);
        }
    },
    {
        icon: "print",
        name: "Print",
        accelerator:  "⌘+p",
        execute: () => {
            window.print();
            return true;
        }
    },
    {
        icon: "bomb",
        name: "Self-Destruct",
        accelerator:  "⌘+h",
        execute: () => {
            alert("Why would you select a menu item labeled \"self-destruct\"?");
            return true;
        }
    }
]


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    const {left, top} = args;
    const ref = useRef(null);
    const [state, setState] = useState({
        visible: false,
        top:0,
        left: 0
    });

    return (
        <div style={{position: "absolute", left: `${left}px`, top: `${top}px`}}
             onClick={() => {
                 setState({...state, visible: false})
             }}
        >
            <div
                ref={ref}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setState({visible: true, top: e.clientY, left: e.clientX});
                }}
            >
                This is a context.
            </div>
            <Menu
                {...props}
                visible={state.visible}
                top={state.top}
                left={state.left}
            >
                {commands.map(command => (
                    <MenuItem
                        name={command.name}
                        icon={command.icon as IconProp}
                        accelerator={command.accelerator}
                        execute={command.execute}
                    />
                ))}
            </Menu>
        </div>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
};




