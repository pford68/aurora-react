import * as React from "react";
import type {Meta, StoryObj} from "@storybook/react-vite";
import DataGrid from "./DataGrid.tsx";
import TableColumn from "./TableColumn.tsx";
import ObservableList, {type Entry, ListItem} from "../../model/ObservableList.ts";
import {useRef} from "react";
import {type Measurements} from "../../../tests/models/Person.ts";
import people from "../../../tests/fixtures/people.json";
import airlineSafety from "../../../tests/fixtures/airline_safety.json";
import type {IconProp} from "@fortawesome/fontawesome-svg-core";
import StatefulInput from "../forms/StatefulInput.tsx";
import type {RendererProps} from "./Datagrid.types.ts";
import MenuItem from "../overlays/MenuItem.tsx";
import type {Struct} from "../../types/types.ts";
import {BooleanDTO, CurrencyDTO, DateDTO, type DTO, NumberDTO, StringDTO} from "../../model/dtos.ts";
import {MeasurementsDTO} from "../../../tests/models/PersonDTO.ts";
import {getDecoratorInstance} from "./typeInference.ts";


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
        nullable: true,
        stickyHeaders: true,
        columnSizing: "auto",
        contained: false,
        resizable: true,
        border: true,
    }
};

export default meta;

type Story = StoryObj<PropsAndArgs>;


const log = {
    icon :"pencil",
    name:"Log",
    accelerator: "⌘+l",
    execute: (e: React.MouseEvent) => {
        if (e.target instanceof HTMLElement) {
            console.log("Value: ", e.target.textContent);
        }
        return true;
    }
}


const highlight = {
    icon: "bomb",
    name: "Self-Destruct",
    accelerator: "⌘+h",
    execute: (e: React.MouseEvent) =>{
        alert("Why would you select a menu item labeled \"self-destruct\"?");
        console.log(e.target)
        return true;
    }
}


const defaultRenderer = (args: PropsAndArgs) => {
    const props = {...args, width: undefined};
    return (
        <DataGrid
            {...props}
            contextMenuItems={[
                <MenuItem
                    icon={log.icon as IconProp}
                    name={log.name}
                    accelerator={log.accelerator}
                    execute={log.execute}
                />,
            ]}
        >
            <TableColumn
                name="firstName"
                text="First Name"
                validator={(v:string) => v != "Bob"}
                contextMenuItems={[
                    <MenuItem
                        icon={highlight.icon as IconProp}
                        name={highlight.name}
                        accelerator={highlight.accelerator}
                        execute={highlight.execute}
                    />,
                ]}
            />
            <TableColumn name="lastName" text="Last Name" required />
            <TableColumn type="currency" name="amount" text="Amount" />
            <TableColumn type="number" name="age" text="Age" />
            <TableColumn type="boolean" name="active" text="Active" formType="checkbox" />
            <TableColumn type="date" name="lastUpdated" text="Last Updated" width={100} />
            <TableColumn
                name="measurements"
                text="Height"
                renderer={(props: RendererProps) => {
                    const measurements = props.value;
                    return (
                        <StatefulInput
                            type="number"
                            ref={props.ref}
                            name={props.name}
                            value={measurements?.valueOf() ?? 0}
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


const peopleTransformer = (person: Struct) => {
    const data = {
        firstName: new StringDTO(person["firstName"]),
        lastName: new StringDTO(person["lastName"]),
        amount: new CurrencyDTO(person["amount"]),
        age: new NumberDTO(person["age"]),
        active: new BooleanDTO(person["active"], {formType: "checkbox"}),
        lastUpdated: new DateDTO(person["lastUpdated"]),
        measurements: new MeasurementsDTO(person["measurements"])
    }
    return new ListItem(data);
}


function airlineSafetyTransformer<T>(item: T){
    const data: Record<string, DTO<string | number | boolean>> = {};

    for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
            const itemKey = key as keyof T;
            data[key] = getDecoratorInstance(item[itemKey] as string | number | boolean);
        }
    }
    return new ListItem(data) as unknown as Entry<T>;
}

export const Primary: Story = {
    args: {
        data: new ObservableList(people, peopleTransformer),
        sortColumn: "lastName",
    },
    render: defaultRenderer,
};


export const AirlineSafety: Story = {
    args: {
        data: new ObservableList(airlineSafety, airlineSafetyTransformer),
        showRowCount: false,
    },
    render: airlineSafetyRenderer,
};



