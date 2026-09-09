import { useEffect, useRef, useState } from 'react';

interface Option {
  id: number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: number;
  onChange: (id: number | undefined) => void;
  placeholder?: string;
}

// حقل بحث بيفلتر القائمة وانت بتكتب - يفيد لما عدد الموردين/العملاء يكبر
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'اكتب للبحث...',
}: SearchableSelectProps) {
  const selected = options.find((o) => o.id === value);
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // لو اتغيّر العنصر المختار من برّه (مثلاً السطر اتصفّر)، حدّث النص الظاهر
  useEffect(() => {
    setQuery(selected?.label ?? '');
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        // لو قفل من غير ما يختار حاجة مطابقة، رجّع النص لآخر عنصر متأكد منه
        setQuery(selected?.label ?? '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected]);

  const filtered =
    query.trim() === ''
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange(undefined);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto bg-white border border-vault-100 rounded-lg shadow-lg">
          {filtered.map((o) => (
            <li
              key={o.id}
              onMouseDown={() => {
                onChange(o.id);
                setQuery(o.label);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm hover:bg-vault-50 cursor-pointer"
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-vault-100 rounded-lg shadow-lg px-3 py-2 text-sm text-vault-500">
          لا يوجد نتائج
        </div>
      )}
    </div>
  );
}
