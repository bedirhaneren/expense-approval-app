import { initialsOf } from '@/lib/format';

export function PersonAvatar({ fullName }: { fullName: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
      >
        {initialsOf(fullName)}
      </span>
      <span className="font-medium">{fullName}</span>
    </span>
  );
}
