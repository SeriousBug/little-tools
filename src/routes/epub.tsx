import { EpubPage } from '@/epub';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/epub')({
  component: RouteComponent,
});

function RouteComponent() {
  return <EpubPage />;
}
