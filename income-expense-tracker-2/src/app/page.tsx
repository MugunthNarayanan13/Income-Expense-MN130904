import AddIncome from "@/components/AddIncome";
import { ModeToggle } from "@/components/mode-switch";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col h-screen">
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center flex-grow">Dashboard</h1>
        <ModeToggle />
      </header>
      <div className="flex-grow flex">
        <AddIncome />
      </div>
    </div>
  );
}
