import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative z-10 flex min-h-[100svh] w-full min-w-0 max-w-full flex-col overflow-x-clip bg-background">
      <Header />
      <main className="relative min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}

export function withMainLayout<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => (
    <MainLayout>
      <Component {...props} />
    </MainLayout>
  );
}

