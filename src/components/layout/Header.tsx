import Image from 'next/image';
import { UserStatus } from '../UserStatus';

export function Header() {
  return (
    <header className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <Image
          src="/assets/images/logo.png"
          alt="Logo Frost Wolf"
          width={52}
          height={52}
          unoptimized
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_0_6px_#84cc16]">
            Frost Wolf Clan
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">Cores de progressão</p>
        </div>
      </div>
      <UserStatus />
    </header>
  );
}
