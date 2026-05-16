import { redirect } from 'next/navigation';
import { Card, Container, TopHeader } from '@/components/ui';
import { getMyOrganization } from '@/lib/auth';
import { OnboardForm } from './OnboardForm';

export default async function OnboardPage() {
  const { organization } = await getMyOrganization();
  if (organization) redirect('/dashboard');
  return (
    <Container size="form">
      <TopHeader
        title="Create your organization"
        subtitle="Hackathons live inside an organization workspace."
      />
      <Card>
        <OnboardForm />
      </Card>
    </Container>
  );
}
