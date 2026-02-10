'use client';

import QuickClipButton from './QuickClipButton';
import QuickClipModal from './QuickClipModal';
import NotificationProvider from './NotificationProvider';

export default function ASWProviders() {
  return (
    <>
      <NotificationProvider />
      <QuickClipButton />
      <QuickClipModal />
    </>
  );
}
