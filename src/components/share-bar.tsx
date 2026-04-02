'use client';

import { useCallback, useEffect, useState } from 'react';

type CopyStatus = 'idle' | 'copied' | 'error';

export type ShareBarProps = {
  /** Shown in the system share sheet (where supported). */
  shareTitle: string;
  /** Short description for native share dialogs. */
  shareText: string;
};

export function ShareBar({ shareTitle, shareText }: ShareBarProps) {
  const [pageUrl, setPageUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
    setCanUseNativeShare(typeof navigator.share === 'function');
  }, []);

  const copyLink = useCallback(async () => {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 3200);
    }
  }, [pageUrl]);

  const openNativeShare = useCallback(async () => {
    if (!pageUrl || typeof navigator.share !== 'function') return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: pageUrl,
      });
    } catch (e) {
      const name = e && typeof e === 'object' && 'name' in e ? String((e as { name: unknown }).name) : '';
      if (name === 'AbortError') return;
    }
  }, [pageUrl, shareTitle, shareText]);

  return (
    <div className="share-bar" role="region" aria-label="Share this page">
      <div className="share-bar__actions">
        <button type="button" className="btn btn-share" onClick={copyLink} disabled={!pageUrl}>
          Copy link
        </button>
        {canUseNativeShare ? (
          <button type="button" className="btn btn-share" onClick={openNativeShare} disabled={!pageUrl}>
            Share
          </button>
        ) : null}
      </div>
      <div className="share-bar__status" aria-live="polite">
        {copyStatus === 'copied' ? <span className="share-bar__ok">Link copied</span> : null}
        {copyStatus === 'error' ? <span className="share-bar__err">Could not copy — try again</span> : null}
      </div>
    </div>
  );
}
