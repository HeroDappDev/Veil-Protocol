import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative z-10">
      <Header />
      <main className="flex-1 relative">
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

