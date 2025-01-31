import Main from "@/components/main";
import AddIncome from "@/components/AddIncome";

export default function HomePage() {
  return (
    <Main>
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <AddIncome />
    </Main>
  );
}
