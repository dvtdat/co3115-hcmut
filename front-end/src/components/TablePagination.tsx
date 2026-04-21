import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({ page, totalPages, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  // Build visible page list with surrounding window and ellipsis
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  const rangeStart = Math.max(2, page - 1);
  const rangeEnd = Math.min(totalPages - 1, page + 1);

  pages.push(1);
  if (rangeStart > 2) pages.push("ellipsis-start");
  for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
  if (rangeEnd < totalPages - 1) pages.push("ellipsis-end");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            disabled={page === 1}
            className="pl-1.5!"
            onClick={() => {
              onPageChange(page - 1);
            }}
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>

        {pages.map((p) =>
          p === "ellipsis-start" || p === "ellipsis-end" ? (
            <PaginationItem key={p}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <Button
                variant={p === page ? "outline" : "ghost"}
                size="icon"
                onClick={() => {
                  onPageChange(p);
                }}
              >
                {p}
              </Button>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            disabled={page === totalPages}
            className="pr-1.5!"
            onClick={() => {
              onPageChange(page + 1);
            }}
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
