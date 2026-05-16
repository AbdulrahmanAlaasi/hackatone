'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, Input } from '@/components/ui';
import { addCriterion, deleteCriterion, updateCriterion } from '../actions';

type Criterion = {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  sort_order: number;
};

export function CriteriaEditor({
  hackathonId,
  criteria,
}: {
  hackathonId: string;
  criteria: Criterion[];
}) {
  const router = useRouter();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWeight, setNewWeight] = useState(1);
  const [pending, start] = useTransition();

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {criteria.map((c) => (
        <CriterionCard key={c.id} hackathonId={hackathonId} criterion={c} />
      ))}

      <Card>
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-h3)', fontWeight: 800 }}>Add criterion</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(() => {
              void (async () => {
                await addCriterion(hackathonId, {
                  name: newName,
                  description: newDesc,
                  weight: newWeight,
                  sort_order: criteria.length + 1,
                });
                setNewName('');
                setNewDesc('');
                setNewWeight(1);
                router.refresh();
              })();
            });
          }}
          style={{
            display: 'grid',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-3)',
            gridTemplateColumns: '2fr 3fr 1fr auto',
            alignItems: 'end',
          }}
        >
          <Field label="Name" htmlFor="c-name">
            <Input id="c-name" required value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="c-desc">
            <Input id="c-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </Field>
          <Field label="Weight" htmlFor="c-w">
            <Input id="c-w" type="number" step="0.1" min={0.1} value={newWeight} onChange={(e) => setNewWeight(+e.target.value)} />
          </Field>
          <Button type="submit" loading={pending}>Add</Button>
        </form>
      </Card>
    </div>
  );
}

function CriterionCard({ hackathonId, criterion }: { hackathonId: string; criterion: Criterion }) {
  const router = useRouter();
  const [name, setName] = useState(criterion.name);
  const [desc, setDesc] = useState(criterion.description ?? '');
  const [weight, setWeight] = useState(criterion.weight);
  const [pending, start] = useTransition();

  return (
    <Card>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-3)',
          gridTemplateColumns: '2fr 3fr 1fr auto auto',
          alignItems: 'end',
        }}
      >
        <Field label="Name" htmlFor={`n-${criterion.id}`}>
          <Input id={`n-${criterion.id}`} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description" htmlFor={`d-${criterion.id}`}>
          <Input id={`d-${criterion.id}`} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <Field label="Weight" htmlFor={`w-${criterion.id}`}>
          <Input
            id={`w-${criterion.id}`}
            type="number"
            step="0.1"
            min={0.1}
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
          />
        </Field>
        <Button
          variant="secondary"
          loading={pending}
          onClick={() =>
            start(() => {
              void (async () => {
                await updateCriterion(hackathonId, criterion.id, { name, description: desc || null, weight });
                router.refresh();
              })();
            })
          }
        >
          Save
        </Button>
        <Button
          variant="text"
          loading={pending}
          onClick={() =>
            start(() => {
              void (async () => {
                await deleteCriterion(hackathonId, criterion.id);
                router.refresh();
              })();
            })
          }
        >
          Remove
        </Button>
      </div>
    </Card>
  );
}
