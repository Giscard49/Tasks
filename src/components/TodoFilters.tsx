import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FilterType, SortType } from './TodoApp';
import { ArrowUpDown } from 'lucide-react';

interface TodoFiltersProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
}

export function TodoFilters({ filter, sort, onFilterChange, onSortChange }: TodoFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="text-sm">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-sm">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort Dropdown */}
      <Select value={sort} onValueChange={(value) => onSortChange(value as SortType)}>
        <SelectTrigger className="h-11 bg-input-background border-0">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Sort by..." />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">📅 Newest First</SelectItem>
          <SelectItem value="oldest">📅 Oldest First</SelectItem>
          <SelectItem value="alphabetical">🔤 Alphabetical</SelectItem>
          <SelectItem value="priority">⚡ Priority</SelectItem>
          <SelectItem value="duedate">🗓️ Due Date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}