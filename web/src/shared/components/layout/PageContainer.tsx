interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="max-w-2xl mx-auto p-4 space-y-4">{children}</div>;
}
