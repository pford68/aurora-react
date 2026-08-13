import * as React from "react";
import type {Meta} from "@storybook/react-vite";
import EnumRenderer from "../../components/renderers/EnumRenderer";
import withReadonlyMode from "../../components/renderers/withReadonlyMode.tsx";
import type {ComponentType} from "react";

type PropsAndArgs = React.ComponentProps<typeof EnumRenderer> & {
    width: number,
};

const meta: Meta<PropsAndArgs> = {
    title: "renderers/EnumRenderer",
    component: EnumRenderer,
    args: {
        width: 800,
        role: "combobox",
        listItems: [
            "green",
            "blue",
            "red",
            "yellow",
            "black",
            "sliver",
            "copper",
            "gold",
        ],
    },
};

export default meta;


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <EnumRenderer {...props} />
        </div>
    );
};

const Renderer = withReadonlyMode(EnumRenderer as ComponentType<any>);
const hocRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <div style={{width: "800px"}}>
            <Renderer {...props} />
        </div>
    );
};

export const Primary = {
    render: defaultRenderer
}

export const WithReadOnlyMoade = {
    render: hocRenderer
}
