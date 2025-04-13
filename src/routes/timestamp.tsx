import { TimestampPage } from '@/timestamps';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/timestamp')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TimestampPage />;
}
