'use client';

import { CoreCard } from './CoreCard';
import { CoreEditor } from './CoreEditor';
import { useAuth } from '../../context/AuthContext';

export function CoreWithEditor({ core }: { core: Core }) {
  const { user, loading, role } = useAuth();
  const showEditor = !loading && user && role === "RL";

  return (
    <div className="space-y-4">
      <CoreCard core={core} />
      {showEditor && <CoreEditor core={core} />}
    </div>
  );
}
