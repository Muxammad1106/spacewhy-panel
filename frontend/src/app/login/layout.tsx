'use client';

import { GuestGuard } from 'src/auth/guard';

type Props = {
  children: React.ReactNode;
};

export default function LoginLayout({ children }: Props) {
  return <GuestGuard>{children}</GuestGuard>;
}
