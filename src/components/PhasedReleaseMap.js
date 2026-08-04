import {useEffect, useRef, useState} from 'react';

import styles from './PhasedReleaseMap.module.css';

const STORAGE_KEY = 'accommodation-phased-release-map:v1';

const PHASE_DEFINITIONS = [
  {
    id: 'phase-1',
    number: 'Phase 1',
    title: 'Release one · core loop',
    footer: 'Delivered end to end in release one',
    icon: 'rocket',
    items: [
      'Destination and site search',
      'Filtered, sorted list view',
      'Static policy (as per Tetra Pak)',
      'Request submission',
      'Client operator queue and decision',
      'Confirmation, notifications, audit',
    ],
  },
  {
    id: 'phase-2',
    number: 'Phase 2',
    title: 'Extend the journey',
    footer: 'Sequenced after release one lands',
    icon: 'expand',
    items: [
      'Map view · requested, proposed post-MVP',
      'Dynamic policy',
      'Client operator-triggered booking',
      'Multiple customers',
      'Group or multi-city travel',
      'Voice and call support',
    ],
  },
  {
    id: 'phase-3',
    number: 'Phase 3',
    title: 'Scale and integrate',
    footer: 'Subject to review and prioritisation',
    prompt: 'Further items to be confirmed during discovery',
    icon: 'layers',
    items: [
      'Flights or ground transport',
      'Multiple suppliers',
      'Expenses',
      'Automated finance reconciliation',
      'Discounts and offers',
    ],
  },
];

function createDefaultPhases() {
  return PHASE_DEFINITIONS.map((phase) => ({
    ...phase,
    items: phase.items.map((text, index) => ({
      id: `${phase.id}-item-${index + 1}`,
      text,
    })),
  }));
}

function createItemId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatSavedTime(timestamp) {
  if (!timestamp) return 'Saving…';

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function normaliseSavedPhases(savedPhases) {
  if (!Array.isArray(savedPhases)) return null;

  return PHASE_DEFINITIONS.map((definition) => {
    const savedPhase = savedPhases.find((phase) => phase?.id === definition.id);
    if (!savedPhase || !Array.isArray(savedPhase.items)) {
      return createDefaultPhases().find((phase) => phase.id === definition.id);
    }

    const items = savedPhase.items
      .filter((item) => item && typeof item.text === 'string')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : createItemId(),
        text: item.text.trim(),
      }))
      .filter((item) => item.text.length > 0);

    return {...definition, items};
  });
}

function PhaseIcon({name}) {
  if (name === 'rocket') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18.5 5.1c3.5-2.1 7.2-2.3 8.7-2.2.1 1.5-.1 5.3-2.2 8.7l-7.6 7.6-4.9.2.2-4.9 6-7.6Z" />
        <path d="m12.7 12.8-5.1.7-3.3 3.3 6 .7m4.2 4.2.7 6 3.3-3.3.7-5.1M8.9 22.9c-2.3.6-3.4 2.3-3.9 4.1 1.8-.5 3.5-1.6 4.1-3.9" />
        <circle cx="21.8" cy="8.3" r="2.1" />
      </svg>
    );
  }

  if (name === 'expand') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18 4h10v10M28 4 17 15M14 28H4V18M4 28l11-11" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="m16 3 13 6-13 6L3 9l13-6Zm13 12-13 6-13-6m26 6-13 6-13-6" />
    </svg>
  );
}

export default function PhasedReleaseMap() {
  const [phases, setPhases] = useState(createDefaultPhases);
  const [drafts, setDrafts] = useState({});
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverPhase, setDragOverPhase] = useState(null);
  const draggedItemRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = normaliseSavedPhases(parsed.phases);
        if (restored) setPhases(restored);
        if (parsed.savedAt) setSavedAt(parsed.savedAt);
      }
    } catch {
      // A malformed or unavailable local draft should not block the workshop.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    const timestamp = new Date().toISOString();
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({schemaVersion: 1, savedAt: timestamp, phases}),
      );
      setSavedAt(timestamp);
    } catch {
      // The board remains usable when browser storage is unavailable.
    }
  }, [phases, ready]);

  function addItem(phaseId, event) {
    event.preventDefault();
    const text = (drafts[phaseId] || '').trim();
    if (!text) return;

    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {...phase, items: [...phase.items, {id: createItemId(), text}]}
          : phase,
      ),
    );
    setDrafts((current) => ({...current, [phaseId]: ''}));
  }

  function removeItem(phaseId, itemId) {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? {...phase, items: phase.items.filter((item) => item.id !== itemId)}
          : phase,
      ),
    );
  }

  function moveItem(itemId, sourcePhaseId, targetPhaseId) {
    if (!itemId || !sourcePhaseId || sourcePhaseId === targetPhaseId) return;

    setPhases((current) => {
      const source = current.find((phase) => phase.id === sourcePhaseId);
      const item = source?.items.find((candidate) => candidate.id === itemId);
      if (!item) return current;

      return current.map((phase) => {
        if (phase.id === sourcePhaseId) {
          return {
            ...phase,
            items: phase.items.filter((candidate) => candidate.id !== itemId),
          };
        }
        if (phase.id === targetPhaseId) {
          return {...phase, items: [...phase.items, item]};
        }
        return phase;
      });
    });
  }

  function beginDrag(event, itemId, phaseId) {
    const dragContext = {itemId, phaseId};
    draggedItemRef.current = dragContext;
    setDraggedItem(dragContext);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.setData(
      'application/x-release-map-item',
      JSON.stringify(dragContext),
    );
  }

  function endDrag() {
    draggedItemRef.current = null;
    setDraggedItem(null);
    setDragOverPhase(null);
  }

  function dropOnPhase(event, phaseId) {
    event.preventDefault();
    event.stopPropagation();
    let context = draggedItemRef.current;

    if (!context) {
      try {
        context = JSON.parse(
          event.dataTransfer.getData('application/x-release-map-item'),
        );
      } catch {
        context = null;
      }
    }

    if (context) moveItem(context.itemId, context.phaseId, phaseId);
    endDrag();
  }

  function resetPlan() {
    if (!window.confirm('Reset the release map to its original phase plan?')) {
      return;
    }

    setPhases(createDefaultPhases());
    setDrafts({});
  }

  function downloadPlan() {
    const content = JSON.stringify(
      {schemaVersion: 1, exportedAt: new Date().toISOString(), phases},
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([content], {type: 'application/json'}),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'phased-release-map.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={styles.releaseMap} aria-labelledby="release-map-title">
      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>
            Section 6 · Delivery roadmap and scope
          </p>
          <h1 id="release-map-title">Phased release map</h1>
          <p className={styles.instructions}>
            Add capabilities during the workshop, then drag cards—or use the
            move menu—to place each item in the right release.
          </p>
        </div>
        <div className={styles.toolbar} aria-label="Release map actions">
          <span className={styles.saveStatus} role="status">
            <span aria-hidden="true" />
            {savedAt ? `Saved ${formatSavedTime(savedAt)}` : formatSavedTime()}
          </span>
          <button type="button" onClick={downloadPlan}>
            Download JSON
          </button>
          <button type="button" onClick={resetPlan}>
            Reset plan
          </button>
        </div>
      </header>

      <div className={styles.board}>
        {phases.map((phase, phaseIndex) => {
          const isDropTarget = dragOverPhase === phase.id;

          return (
            <article
              className={`${styles.phase} ${
                isDropTarget ? styles.dropTarget : ''
              }`}
              aria-label={`${phase.number}: ${phase.title}`}
              data-phase-id={phase.id}
              key={phase.id}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragOverPhase(phase.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setDragOverPhase(null);
                }
              }}
              onDrop={(event) => dropOnPhase(event, phase.id)}>
              <header
                className={`${styles.phaseHeader} ${
                  styles[`phaseHeader${phaseIndex + 1}`]
                }`}>
                <span className={styles.phaseIcon}>
                  <PhaseIcon name={phase.icon} />
                </span>
                <span>
                  <strong>{phase.number}</strong>
                  <span>{phase.title}</span>
                </span>
                <span className={styles.itemCount}>{phase.items.length}</span>
              </header>

              <div className={styles.phaseBody}>
                <div
                  className={styles.items}
                  aria-label={`${phase.number} items`}>
                  {phase.items.map((item) => (
                    <article
                      className={`${styles.item} ${
                        draggedItem?.itemId === item.id
                          ? styles.dragging
                          : ''
                      }`}
                      data-item-id={item.id}
                      draggable
                      key={item.id}
                      onDragStart={(event) =>
                        beginDrag(event, item.id, phase.id)
                      }
                      onDragEnd={endDrag}>
                      <span className={styles.dragHandle} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className={styles.itemText}>{item.text}</span>
                      <div className={styles.itemActions}>
                        <label>
                          <span className={styles.visuallyHidden}>
                            Move {item.text} to another phase
                          </span>
                          <select
                            value=""
                            draggable={false}
                            onChange={(event) =>
                              moveItem(
                                item.id,
                                phase.id,
                                event.currentTarget.value,
                              )
                            }>
                            <option value="">Move to…</option>
                            {phases
                              .filter((candidate) => candidate.id !== phase.id)
                              .map((candidate) => (
                                <option
                                  value={candidate.id}
                                  key={candidate.id}>
                                  {candidate.number}
                                </option>
                              ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          draggable={false}
                          aria-label={`Remove ${item.text}`}
                          title="Remove item"
                          onClick={() => removeItem(phase.id, item.id)}>
                          ×
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {phase.prompt && (
                  <div className={styles.discoveryPrompt}>{phase.prompt}</div>
                )}

                <form
                  className={styles.addItem}
                  onSubmit={(event) => addItem(phase.id, event)}>
                  <label htmlFor={`${phase.id}-new-item`}>
                    Add an item to {phase.number}
                  </label>
                  <div>
                    <input
                      id={`${phase.id}-new-item`}
                      type="text"
                      value={drafts[phase.id] || ''}
                      placeholder="Enter a capability or outcome"
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [phase.id]: event.target.value,
                        }))
                      }
                    />
                    <button type="submit">Add</button>
                  </div>
                </form>

                <footer>{phase.footer}</footer>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
