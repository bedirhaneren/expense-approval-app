import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <Card>
      <EmptyState
        icon="description"
        title="Masraf bulunamadı"
        description="Aradığınız kayıt yok ya da görüntüleme yetkiniz bulunmuyor."
        action={
          <LinkButton href="/" variant="secondary">
            Ana sayfaya dön
          </LinkButton>
        }
      />
    </Card>
  );
}
