import { redirect } from 'next/navigation';

export default function PrizmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect('/asw');
}
