import { MetadataPage } from '@/metadata';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/metadata')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MetadataPage />;
}
