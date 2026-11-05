/**
 * Material Symbols used in the app. The font request is built from this list,
 * so only these glyphs are downloaded.
 */
export const ICON_NAMES = [
  'add',
  'arrow_back',
  'block',
  'cancel',
  'check',
  'check_circle',
  'chevron_right',
  'close',
  'description',
  'edit',
  'error',
  'history',
  'hotel',
  'info',
  'local_taxi',
  'logout',
  'person',
  'progress_activity',
  'receipt_long',
  'restaurant',
  'send',
  'visibility',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0' +
  `&icon_names=${[...ICON_NAMES].sort().join(',')}&display=block`;

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = '' }: IconProps) {
  return (
    <span aria-hidden="true" className={`icon ${className}`}>
      {name}
    </span>
  );
}
