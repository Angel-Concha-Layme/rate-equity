import { textureStyle } from "@/components/lab/Texture";
import { AppShell } from "@/components/app/AppShell";
import { Toaster } from "@/components/common/Toast";

export default function Home() {
  return (
    <div
      data-theme="ledger-v2"
      style={textureStyle("ledger-v2")}
      className="min-h-screen overflow-x-clip bg-canvas font-sans text-ink selection:bg-accent/25"
    >
      <main className="px-4 sm:px-6 lg:px-8">
        <AppShell />
      </main>
      <Toaster />
    </div>
  );
}
