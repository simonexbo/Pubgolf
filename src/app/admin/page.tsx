'use client';

import AdminGate from '@/components/AdminGate';
import PageAdmin from '@/components/PageAdmin';

export default function AdminPage() {
  return (
    <AdminGate>
      <PageAdmin />
    </AdminGate>
  );
}
