'use client'
import { Category, EntriesResponse, EntryListProps } from "@/app/lib/services/types/interfaces";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterIcon, SearchIcon, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { EntryCard } from "./EntryCard";

export function EntryList({ onEntryClick, onNewEntry }: EntryListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  }
  );
  const { data, isLoading, error, refetch } = useQuery<EntriesResponse>({
    queryKey: ['entries', page, searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString())
      params.append("limit", "10")
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("categoryId", selectedCategory);

      const res = await fetch(`/api/entries?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch entries");
      return res.json()
    }
  });
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    refetch()
  }
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategory('')
    setPage(1)
    refetch()
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading entries. Please try again later
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Journal Entries</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700 dark:text-white" onClick={onNewEntry}>New Entry</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <FilterIcon size={18} />
          Filters
        </Button>
      </div>

      {isFilterOpen && (
        <div className="bg-slate-50 rounded-md space-y-2 flex align-center justify-between dark:bg-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button className="hover:bg-red-600 mx-2" variant={"destructive"} size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <X className={"font-md"} />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-2 mt-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No journal entries found.</p>
            <Button onClick={onNewEntry}>Create Your First Entry</Button>
          </div>
        ) : (
          data?.entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEntryClick={() => onEntryClick(entry.id)}
            />
          ))
        )}

        {data && data.pagination.totalPages > 1 && (
          <Pagination
          // currentPage={page}
          // totalPages={data.pagination.totalPages}
          // onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
