import Main from "@/components/main";
import AddIncome from "@/components/AddIncome";
import { ModeToggle } from "@/components/mode-switch";

export default function HomePage() {
  return (
    <Main>
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ModeToggle />
      </header>
      <AddIncome />
    </Main>
  );
}
