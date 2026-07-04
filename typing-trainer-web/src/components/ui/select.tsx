import { cn } from '@/lib/utils';

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
}

const Select = ({ className, onChange, options, ...props }: SelectProps) => {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export { Select };
