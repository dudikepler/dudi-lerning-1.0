export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required = true,
  placeholder,
  textarea = false,
  rows = 4,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)]"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="rounded-lg border border-[var(--tp-border)] bg-[var(--tp-surface)] px-4 py-2 outline-none focus:border-[var(--tp-primary)]"
        />
      )}
    </label>
  );
}
