import { FilterFn } from "@tanstack/react-table"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayIncludes: FilterFn<any> = (row, columnId, filterValue) => {
    const selected: string[] = Array.isArray(filterValue) ? filterValue : []
    if (selected.length === 0) return true

    const raw = row.getValue(columnId)
    const cell = typeof raw === "boolean" ? String(raw) : String(raw)
    return selected.includes(cell)
}
