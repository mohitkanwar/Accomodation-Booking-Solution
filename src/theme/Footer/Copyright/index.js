import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function formatInVisitorTimezone(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export default function FooterCopyright({copyright}) {
  const {siteConfig} = useDocusaurusContext();
  const {docsVersion, buildTimestamp} = siteConfig.customFields;
  const [localBuildTime, setLocalBuildTime] = useState('');

  useEffect(() => {
    setLocalBuildTime(formatInVisitorTimezone(buildTimestamp));
  }, [buildTimestamp]);

  return (
    <div className="footer__copyright">
      <span dangerouslySetInnerHTML={{__html: copyright}} />
      <span className="footer-build-meta">
        v{docsVersion} · Built{' '}
        <time dateTime={buildTimestamp}>
          {localBuildTime || 'local time loading…'}
        </time>
      </span>
    </div>
  );
}
