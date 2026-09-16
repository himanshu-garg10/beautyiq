"use client";

import * as React from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface AdminTableProps<T> {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filters?: FilterOption[];
  actions?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  itemsPerPage?: number;
  className?: string;
}

export function AdminTable<T>({
  title,
  description,
  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  filters = [],
  actions,
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search criteria or active filters.",
  itemsPerPage = 10,
  className,
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to page 1 on filter or search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, data.length]);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {(title || description) && (
          <div>
            {title && (
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-foreground-muted mt-0.5">{description}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 self-end md:self-auto">
          {actions}
        </div>
      </div>

      {/* Filter / Search Row */}
      {(onSearchChange || filters.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-background-card p-3 rounded-lg border border-line">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-faint" />
              <input
                type="text"
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-background rounded pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-foreground-faint border border-line focus:outline-hidden focus:border-sage-deep transition-colors"
              />
            </div>
          )}

          {filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <div key={f.key} className="flex items-center gap-1.5">
                  <span className="text-[0.7rem] uppercase font-bold text-foreground-faint">
                    {f.label}:
                  </span>
                  <select
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="bg-background rounded px-2.5 py-1 text-xs text-foreground border border-line focus:outline-hidden focus:border-sage-deep"
                  >
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-lg border border-line bg-background-card overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-background-elevated/60 hover:bg-background-elevated/60 border-b border-line">
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      "text-[0.7rem] uppercase font-bold text-foreground-muted tracking-wider py-3 px-4",
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <TableRow key={rIdx} className="border-b border-line">
                    {columns.map((_, cIdx) => (
                      <TableCell key={cIdx} className="py-3 px-4">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-12 text-center">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={onSearchChange && searchValue ? "Clear Search" : undefined}
                      onAction={onSearchChange && searchValue ? () => onSearchChange("") : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow
                    key={keyExtractor(item)}
                    className="border-b border-line hover:bg-background-elevated/40 transition-colors"
                  >
                    {columns.map((col, cIdx) => (
                      <TableCell
                        key={cIdx}
                        className={cn("text-xs text-foreground py-3 px-4 align-middle", col.className)}
                      >
                        {col.render(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!loading && data.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-line text-xs bg-background-elevated/20">
            <span className="text-foreground-faint">
              Showing{" "}
              <strong className="text-foreground font-semibold">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground font-semibold">
                {Math.min(currentPage * itemsPerPage, data.length)}
              </strong>{" "}
              of <strong className="text-foreground font-semibold">{data.length}</strong> entries
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-mono font-semibold text-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
