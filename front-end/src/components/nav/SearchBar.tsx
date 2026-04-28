import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/hooks/use-products";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e8f5e9/4caf50?text=No+Image";

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debounced;
}

interface SearchBarProps {
  onNavigate?: () => void;
}

export default function SearchBar({ onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);
  const { data: results, isFetching } = useProductSearch(debouncedQuery);

  const showDropdown = open && debouncedQuery.trim().length >= 2;

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    onNavigate?.();
    void navigate({ to: "/products", search: { q } });
  }

  function handleSelect() {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
          }}
          placeholder="Search products..."
          className="pl-8"
          type="search"
          autoComplete="off"
        />
      </form>

      {showDropdown && (
        <div className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border shadow-md">
          {isFetching && (!results || results.length === 0) ? (
            <div className="text-muted-foreground px-4 py-3 text-sm">Searching...</div>
          ) : results && results.length > 0 ? (
            <>
              <ul>
                {results.map((product) => (
                  <li key={product._id}>
                    <Link
                      to="/products/$id"
                      params={{ id: product._id }}
                      onClick={handleSelect}
                      className="hover:bg-muted flex items-center gap-3 px-3 py-2.5 transition-colors"
                    >
                      <img
                        src={product.image ?? PLACEHOLDER_IMAGE}
                        alt={product.name}
                        className="size-10 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">{formatVND(product.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t">
                <button
                  type="button"
                  onClick={() => {
                    const q = query.trim();
                    setOpen(false);
                    setQuery("");
                    onNavigate?.();
                    void navigate({ to: "/products", search: { q } });
                  }}
                  className="text-primary hover:bg-muted w-full px-4 py-2.5 text-left text-xs font-medium transition-colors"
                >
                  View all results for &ldquo;{debouncedQuery}&rdquo; →
                </button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground px-4 py-3 text-sm">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
