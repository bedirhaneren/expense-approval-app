'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon="error"
        title="Bir hata oluştu"
        description="Sayfa yüklenirken beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin."
        action={<Button onClick={reset}>Tekrar dene</Button>}
      />
    </Card>
  );
}
