export default function Card({ children }: any) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      {children}
    </div>
  );
}