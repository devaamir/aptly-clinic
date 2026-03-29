import type { FC, ReactNode } from 'react'
import './DataTable.css'

export interface Column<T> {
  key: string
  header: string
  render: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  rowClassName?: (row: T) => string
}

function DataTable<T>({ columns, data, rowKey, rowClassName }: DataTableProps<T>) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={rowKey(row)} className={rowClassName?.(row) ?? ''}>
              {columns.map(col => (
                <td key={col.key}>{col.render(row, idx)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable as FC<DataTableProps<any>>
