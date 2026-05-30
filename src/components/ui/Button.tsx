import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({ loading, children, ...props }: Props) {
  return (
    <button
      {...props}
      className="
        w-full bg-blue-600 text-white py-2 rounded-lg
        hover:bg-blue-700 transition
        disabled:opacity-50
      "
      disabled={loading || props.disabled}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}