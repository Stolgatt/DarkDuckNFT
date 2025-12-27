import Navbar from "@/components/Navbar";
import MintForm from "@/components/MintForm";

export default function MintPage() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Mint a New DarkDuck NFT</h2>
        <MintForm />
      </main>
    </>
  );
}
