import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import Tooltip from "./Tooltip.tsx";

type PropsAndArgs = React.ComponentProps<typeof Tooltip> & {
    width: number,
    height: number,
    left: number,
    top: number,
};


const meta: Meta<PropsAndArgs> = {
    title: "overlays/Tooltip",
    component: Tooltip,
    args: {
        width: 800,
        height: 300,
        left: 10,
        top: 10,
    },
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined, height: undefined};
    return (
        <div style={{position: "absolute", top: `${args.top}px`, left: `${args.left}px`}}>
            <Tooltip {...props} >
                <div>Mouseover this to raise a tooltip.</div>
            </Tooltip>
        </div>
    );
};


export const Primary: Story = {
    render: defaultRenderer,
    args: {
        text: "This is a tooltip.",
    }
};




