import { Base64Page } from '@/base64';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/base64')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Base64Page />;
}
