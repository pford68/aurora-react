import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import DataGrid from "./DataGrid.tsx";
import TableColumn from "./TableColumn.tsx";
import ObservableList, {Record} from "../../ObservableList.ts";
import {useRef} from "react";
import Person, {type Measurements} from "../../../tests/models/Person.ts";
import NumericRenderer from "../renderers/NumericRenderer.tsx";
import people from "../../../tests/fixtures/people.json";
import airlineSafety from "../../../tests/fixtures/airline_safety.json";
import BaseCommand from "../../commands/BaseCommand.ts";
import type {ContextMenuParameter} from "../../types/types.ts";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";
import Text from "../renderers/Text.tsx";
import type {RendererProps} from "../renderers/types.ts";


type PropsAndArgs = React.ComponentProps<typeof DataGrid> & {
    width: number,
    height: number,
    showRowCount?: boolean,
};


const meta: Meta<PropsAndArgs> = {
    title: "DataGrid",
    component: DataGrid,
    args: {
        alternateRows: false,
        nullable: false,
        stickyHeaders: true,
        columnSizing: "auto",
        contained: false,
        resizable: true,
        border: true,
    }
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


class LogCommand extends BaseCommand<ContextMenuParameter>{
    get icon():IconProp { return "pencil"}
    get name() { return "Log"}
    get accelerator() { return "⌘+l"}
    execute = (): boolean => {
        console.log("execute", this.getParameters()[0]);
        console.log("execute: selectedItems", this.getParameters()[0].selectionModel.getSelectedItem());
        console.log("execute: name", this.getParameters()[0].targetRef.current?.getAttribute("[data-col-name]"));
        const param = this.getParameters().pop();
        const {targetRef} = param ?? {};
        if (targetRef?.current) {
            console.log("Value: ", targetRef.current.textContent);
        }
        return true;
    }
}


class HighlightCommand extends BaseCommand<unknown>{
    get icon():IconProp { return "bomb"}
    get name() { return "Self-Destruct"}
    get accelerator() { return "⌘+h"}
    execute(): boolean {
        alert("Why would you select a menu item labeled \"self-destruct\"?");
        return true;
    }
}


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <DataGrid
            {...props}
            contextMenuItems={[
                new LogCommand(),
            ]}
        >
            <TableColumn
                name="firstName"
                text="First Name"
                validator={(v:string) => v != "Bob"}
                contextMenuItems={[
                    new HighlightCommand()
                ]}
            />
            <TableColumn name="lastName" text="Last Name" required />
            <TableColumn type="currency" name="amount" text="Amount" />
            <TableColumn type="number" name="age" text="Age" />
            <TableColumn name="active" text="Active" />
            <TableColumn type="date" name="lastUpdated" text="Last Updated" width={100} />
            <TableColumn
                name="measurements"
                text="Height"
                renderer={(props: RendererProps<unknown>) => {
                    const measurements = props.value;
                    const {height} = measurements ?? {};
                    if (!props.active) {
                        return <Text value={height} />
                    }
                    return (
                        <NumericRenderer
                            active={props.active}
                            rendererRef={props.rendererRef}
                            name={props.name}
                            value={height}
                            className={props.className}
                        />
                    )
                }}
                comparator={(a:Measurements, b:Measurements) => {
                    return a.height - b.height;
                }}
            />
        </DataGrid>
    );
};


const airlineSafetyRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    const containerRef = useRef(null);

    return (
        <section ref={containerRef} style={{height: `${args.height}px`}}>
            <DataGrid {...props} height={500}>
                <TableColumn type="string" name="airline" text="Airline" sticky />
                <TableColumn type="number" name="avail_seat_km_per_week" text="Available Seats"   />
                <TableColumn type="number" name="incidents_85_99" text="Incidents 1999" />
                <TableColumn type="number" name="fatal_accidents_85_99" text="Fatal Accidents 1999" />
                <TableColumn type="number" name="fatalities_85_99" text="Fatalities 1999"/>
                <TableColumn type="number" name="incidents_00_14" text="Incidents 2014" />
                <TableColumn type="number" name="fatal_accidents_00_14" text="Fatal Accidents 2014" />
                <TableColumn type="number" name="fatalities_00_14" text="Fatalities 2014"/>
            </DataGrid>
        </section>
    );
};


export const Primary: Story = {
    args: {
        data: new ObservableList(people.map((item => new Person(item)))),
        sortColumn: "lastName",
    },
    render: defaultRenderer,
};


export const AirlineSafety: Story = {
    args: {
        data: new ObservableList(airlineSafety.map(item => new Record(item))),
        showRowCount: false,
    },
    render: airlineSafetyRenderer,
};



