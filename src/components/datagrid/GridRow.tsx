import {type ReactElement, useContext} from "react";
import {Record as DataRow} from "./../../ObservableList";
import type {Struct} from "../../types/types";
import {joinCss} from "./../../util/utils";
import styles from "./DataGrid.module.css";
import {GridContext} from "./GridContext";
import type {CellRenderProps} from "./cells/GridCell.tsx";

type GridRowProps<T extends Struct, V> = {
    row: DataRow<Struct>,
    rowIndex: number,
    className?: string,
    cellFactory: (columnConfig: CellRenderProps<T, V>, index: number, rowIndex: number) => ReactElement,
}

export default function GridRow<T extends Struct, V>(props: GridRowProps<T, V>): ReactElement {
    const {
        rowIndex,
        cellFactory
    } = props;

    const gridContext = useContext(GridContext);
    const {columns, alternateRows} = gridContext;

    return (
        <div className={joinCss(styles.row, alternateRows && rowIndex % 2 !== 0 ? styles.alternate : "")}>
            {columns.map((col, index) => {
                return cellFactory(col.props, index, rowIndex);
            })}
        </div>
    )
}