import { StoreProvider } from '@/lib/store'
import { AppShell } from '@/components/app-shell'

export default function Page() {
  return (
    <main className="min-h-dvh bg-muted/40">
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </main>
  )
}
