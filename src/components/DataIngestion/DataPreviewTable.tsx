import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TableIcon } from "lucide-react";

interface DataPreviewTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  maxRows?: number;
}

export const DataPreviewTable = ({ columns, rows, maxRows }: DataPreviewTableProps) => {
  // If maxRows is provided, limit the display; otherwise show all rows
  const displayRows = maxRows ? rows.slice(0, maxRows) : rows;
  const hasMore = maxRows ? rows.length > maxRows : false;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Data Preview</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{columns.length} columns</Badge>
            <Badge variant="secondary">{rows.length} rows</Badge>
          </div>
        </div>
        <CardDescription>
          {hasMore 
            ? `Showing first ${displayRows.length} of ${rows.length} rows`
            : `Showing all ${rows.length} rows`
          }
          {" • Scroll to see more"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  {columns.map((col, idx) => (
                    <TableHead key={idx} className="min-w-[120px]">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell className="text-center text-muted-foreground font-mono text-xs">
                      {rowIdx + 1}
                    </TableCell>
                    {columns.map((col, colIdx) => (
                      <TableCell key={colIdx} className="font-mono text-sm">
                        {row[col] !== null && row[col] !== undefined
                          ? String(row[col])
                          : <span className="text-muted-foreground italic">null</span>
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DataPreviewTable;
