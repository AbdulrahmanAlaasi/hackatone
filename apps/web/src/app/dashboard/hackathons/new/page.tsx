import { redirect } from 'next/navigation';
import { Card, Container, TopHeader } from '@/components/ui';
import { getMyOrganization } from '@/lib/auth';
import { NewHackathonForm } from './NewHackathonForm';

export default async function NewHackathonPage() {
  const { organization } = await getMyOrganization();
  if (!organization) redirect('/dashboard/onboard');

  return (
    <Container size="form">
      <TopHeader
        title="New hackathon"
        subtitle={`Creating inside ${organization.name}.`}
      />
      <Card>
        <NewHackathonForm organizationId={organization.id} />
      </Card>
    </Container>
  );
}
