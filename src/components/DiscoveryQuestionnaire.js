import {useEffect, useMemo, useState} from 'react';

import {questionnaireSections} from '../data/discoveryQuestionnaire';
import styles from './DiscoveryQuestionnaire.module.css';

const STORAGE_KEY = 'accommodation-discovery-questionnaire:v1';
const SCHEMA_VERSION = 1;

function createEmptyState() {
  return {
    workshop: {
      name: '',
      client: 'Tetrapak',
      date: '',
      facilitator: '',
    },
    answers: {},
  };
}

function isAnswered(question, answers) {
  const value = answers[question.id];

  if (question.type === 'system-ownership') {
    return (
      value &&
      typeof value === 'object' &&
      Object.values(value).some(
        (entry) =>
          entry &&
          (entry.systemName?.trim().length > 0 ||
            entry.owner?.trim().length > 0),
      )
    );
  }

  if (question.type === 'multi' || question.type === 'text-list') {
    return (
      Array.isArray(value) &&
      value.some((item) => typeof item === 'string' && item.trim().length > 0)
    );
  }

  return typeof value === 'string' && value.trim().length > 0;
}

function formatSavedTime(isoTimestamp) {
  if (!isoTimestamp) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoTimestamp));
}

export default function DiscoveryQuestionnaire() {
  const [formState, setFormState] = useState(createEmptyState);
  const [savedAt, setSavedAt] = useState(null);
  const [status, setStatus] = useState({
    tone: 'neutral',
    message: 'Your answers have not been saved yet.',
  });
  const [dirty, setDirty] = useState(false);

  const requiredQuestions = useMemo(
    () =>
      questionnaireSections.flatMap((section) =>
        section.questions.filter((question) => question.required),
      ),
    [],
  );

  const answeredRequired = requiredQuestions.filter((question) =>
    isAnswered(question, formState.answers),
  ).length;
  const progress = Math.round(
    (answeredRequired / requiredQuestions.length) * 100,
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.data) return;

      setFormState(parsed.data);
      setSavedAt(parsed.savedAt || null);
      setStatus({
        tone: 'success',
        message: parsed.savedAt
          ? `Restored the draft saved ${formatSavedTime(parsed.savedAt)}.`
          : 'Restored your saved draft.',
      });
    } catch {
      setStatus({
        tone: 'warning',
        message:
          'A previous draft could not be restored. You can complete and save a new copy.',
      });
    }
  }, []);

  function updateWorkshop(field, value) {
    setFormState((current) => ({
      ...current,
      workshop: {...current.workshop, [field]: value},
    }));
    markDirty();
  }

  function updateAnswer(questionId, value) {
    setFormState((current) => ({
      ...current,
      answers: {...current.answers, [questionId]: value},
    }));
    markDirty();
  }

  function markDirty() {
    setDirty(true);
    setStatus({
      tone: 'neutral',
      message: 'You have unsaved changes.',
    });
  }

  function toggleMultiAnswer(questionId, option, detailAnswerId) {
    setFormState((currentState) => {
      const current = currentState.answers[questionId] || [];
      const removing = current.includes(option);
      const next = removing
        ? current.filter((item) => item !== option)
        : [...current, option];
      const answers = {...currentState.answers, [questionId]: next};

      if (removing && detailAnswerId) {
        delete answers[detailAnswerId];
      }

      return {...currentState, answers};
    });
    markDirty();
  }

  function updateListAnswer(questionId, itemIndex, value) {
    setFormState((currentState) => {
      const current = Array.isArray(currentState.answers[questionId])
        ? [...currentState.answers[questionId]]
        : [''];
      current[itemIndex] = value;

      return {
        ...currentState,
        answers: {...currentState.answers, [questionId]: current},
      };
    });
    markDirty();
  }

  function updateSystemOwnership(questionId, functionalArea, field, value) {
    setFormState((currentState) => {
      const currentQuestionAnswer =
        currentState.answers[questionId] &&
        !Array.isArray(currentState.answers[questionId]) &&
        typeof currentState.answers[questionId] === 'object'
          ? currentState.answers[questionId]
          : {};
      const currentAreaAnswer = currentQuestionAnswer[functionalArea] || {};

      return {
        ...currentState,
        answers: {
          ...currentState.answers,
          [questionId]: {
            ...currentQuestionAnswer,
            [functionalArea]: {...currentAreaAnswer, [field]: value},
          },
        },
      };
    });
    markDirty();
  }

  function addListAnswer(questionId) {
    setFormState((currentState) => {
      const current = Array.isArray(currentState.answers[questionId])
        ? currentState.answers[questionId]
        : [''];

      return {
        ...currentState,
        answers: {...currentState.answers, [questionId]: [...current, '']},
      };
    });
    markDirty();
  }

  function removeListAnswer(questionId, itemIndex) {
    setFormState((currentState) => {
      const current = Array.isArray(currentState.answers[questionId])
        ? currentState.answers[questionId]
        : [];
      const next = current.filter((_, index) => index !== itemIndex);

      return {
        ...currentState,
        answers: {
          ...currentState.answers,
          [questionId]: next.length > 0 ? next : [''],
        },
      };
    });
    markDirty();
  }

  function createPayload(timestamp = new Date().toISOString()) {
    return {
      schemaVersion: SCHEMA_VERSION,
      savedAt: timestamp,
      data: formState,
    };
  }

  function saveDraft(event) {
    event.preventDefault();
    const timestamp = new Date().toISOString();

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(createPayload(timestamp)),
      );
      setSavedAt(timestamp);
      setDirty(false);

      const remaining = requiredQuestions.length - answeredRequired;
      setStatus({
        tone: 'success',
        message:
          remaining === 0
            ? `Saved ${formatSavedTime(timestamp)}. All key questions are answered.`
            : `Draft saved ${formatSavedTime(timestamp)}. ${remaining} key ${
                remaining === 1 ? 'question remains' : 'questions remain'
              }.`,
      });
    } catch {
      setStatus({
        tone: 'error',
        message:
          'The browser could not save this draft. Download a JSON copy before leaving the page.',
      });
    }
  }

  function downloadAnswers() {
    const timestamp = new Date().toISOString();
    const content = JSON.stringify(createPayload(timestamp), null, 2);
    const blob = new Blob([content], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const date = timestamp.slice(0, 10);
    anchor.href = url;
    anchor.download = `accommodation-discovery-${date}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus({
      tone: 'success',
      message: 'Downloaded a portable JSON copy of the current answers.',
    });
  }

  function clearDraft() {
    const confirmed = window.confirm(
      'Clear every answer and remove the locally saved draft?',
    );
    if (!confirmed) return;

    window.localStorage.removeItem(STORAGE_KEY);
    setFormState(createEmptyState());
    setSavedAt(null);
    setDirty(false);
    setStatus({
      tone: 'neutral',
      message: 'The saved draft and all current answers were cleared.',
    });
  }

  function renderOtherInput(question) {
    const value = formState.answers[question.id];
    const selected =
      value === 'Other' || (Array.isArray(value) && value.includes('Other'));

    if (!selected) return null;

    const otherId = `${question.id}Other`;
    return (
      <label className={styles.otherField} htmlFor={otherId}>
        <span>{question.otherLabel || 'Please provide details'}</span>
        <input
          id={otherId}
          type="text"
          value={formState.answers[otherId] || ''}
          onChange={(event) => updateAnswer(otherId, event.target.value)}
        />
      </label>
    );
  }

  function renderQuestion(question, questionIndex) {
    const fieldId = `question-${question.id}`;
    const questionNumber = String(questionIndex + 1).padStart(2, '0');

    if (question.type === 'system-ownership') {
      const storedAnswer = formState.answers[question.id];
      const ownershipAnswers =
        storedAnswer &&
        !Array.isArray(storedAnswer) &&
        typeof storedAnswer === 'object'
          ? storedAnswer
          : {};

      return (
        <fieldset className={styles.question} key={question.id}>
          <legend className={styles.questionLabel}>
            <span className={styles.questionNumber}>{questionNumber}</span>
            <span>
              {question.label}
              {question.required && (
                <span className={styles.required}> Required</span>
              )}
            </span>
          </legend>
          {question.hint && <p className={styles.hint}>{question.hint}</p>}
          <div className={styles.systemOwnershipTable}>
            <div
              className={`${styles.systemOwnershipRow} ${styles.systemOwnershipHeader}`}
              aria-hidden="true">
              <span>Functional area</span>
              <span>{question.systemNameLabel}</span>
              <span>{question.ownerLabel}</span>
            </div>
            {question.functionalAreas.map((functionalArea) => {
              const areaAnswer = ownershipAnswers[functionalArea] || {};
              const areaSlug = functionalArea
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-');
              const systemFieldId = `${fieldId}-${areaSlug}-system`;
              const ownerFieldId = `${fieldId}-${areaSlug}-owner`;

              return (
                <div className={styles.systemOwnershipRow} key={functionalArea}>
                  <strong>{functionalArea}</strong>
                  <label htmlFor={systemFieldId}>
                    <span>{question.systemNameLabel}</span>
                    <input
                      id={systemFieldId}
                      type="text"
                      aria-label={`${functionalArea}: ${question.systemNameLabel}`}
                      value={areaAnswer.systemName || ''}
                      placeholder={question.systemNamePlaceholder}
                      onChange={(event) =>
                        updateSystemOwnership(
                          question.id,
                          functionalArea,
                          'systemName',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                  <label htmlFor={ownerFieldId}>
                    <span>{question.ownerLabel}</span>
                    <input
                      id={ownerFieldId}
                      type="text"
                      aria-label={`${functionalArea}: ${question.ownerLabel}`}
                      value={areaAnswer.owner || ''}
                      placeholder={question.ownerPlaceholder}
                      onChange={(event) =>
                        updateSystemOwnership(
                          question.id,
                          functionalArea,
                          'owner',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
      );
    }

    if (question.type === 'text-list') {
      const storedItems = formState.answers[question.id];
      const items =
        Array.isArray(storedItems) && storedItems.length > 0
          ? storedItems
          : [''];

      return (
        <fieldset className={styles.question} key={question.id}>
          <legend className={styles.questionLabel}>
            <span className={styles.questionNumber}>{questionNumber}</span>
            <span>
              {question.label}
              {question.required && (
                <span className={styles.required}> Required</span>
              )}
            </span>
          </legend>
          {question.hint && <p className={styles.hint}>{question.hint}</p>}
          <div className={styles.listItems}>
            {items.map((item, itemIndex) => {
              const itemId = `${fieldId}-item-${itemIndex}`;

              return (
                <div className={styles.listItem} key={itemId}>
                  <label htmlFor={itemId}>Issue {itemIndex + 1}</label>
                  <div className={styles.listInputRow}>
                    <input
                      id={itemId}
                      type="text"
                      value={item}
                      placeholder={question.placeholder}
                      onChange={(event) =>
                        updateListAnswer(
                          question.id,
                          itemIndex,
                          event.target.value,
                        )
                      }
                    />
                    {items.length > 1 && (
                      <button
                        className={styles.removeListButton}
                        type="button"
                        aria-label={`Remove issue ${itemIndex + 1}`}
                        onClick={() =>
                          removeListAnswer(question.id, itemIndex)
                        }>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className={styles.addListButton}
            type="button"
            onClick={() => addListAnswer(question.id)}>
            {question.addLabel || 'Add another item'}
          </button>
        </fieldset>
      );
    }

    if (question.type === 'input') {
      return (
        <div className={styles.question} key={question.id}>
          <label className={styles.questionLabel} htmlFor={fieldId}>
            <span className={styles.questionNumber}>{questionNumber}</span>
            <span>
              {question.label}
              {question.required && (
                <span className={styles.required}> Required</span>
              )}
            </span>
          </label>
          {question.hint && <p className={styles.hint}>{question.hint}</p>}
          <input
            id={fieldId}
            type="text"
            inputMode={question.inputMode}
            value={formState.answers[question.id] || ''}
            placeholder={question.placeholder}
            onChange={(event) =>
              updateAnswer(question.id, event.target.value)
            }
          />
        </div>
      );
    }

    if (question.type === 'textarea') {
      return (
        <div className={styles.question} key={question.id}>
          <label className={styles.questionLabel} htmlFor={fieldId}>
            <span className={styles.questionNumber}>{questionNumber}</span>
            <span>
              {question.label}
              {question.required && (
                <span className={styles.required}> Required</span>
              )}
            </span>
          </label>
          {question.hint && <p className={styles.hint}>{question.hint}</p>}
          <textarea
            id={fieldId}
            rows={4}
            value={formState.answers[question.id] || ''}
            placeholder={question.placeholder}
            onChange={(event) =>
              updateAnswer(question.id, event.target.value)
            }
          />
        </div>
      );
    }

    const isMulti = question.type === 'multi';
    const selectedValue = formState.answers[question.id];

    return (
      <fieldset className={styles.question} key={question.id}>
        <legend className={styles.questionLabel}>
          <span className={styles.questionNumber}>{questionNumber}</span>
          <span>
            {question.label}
            {question.required && (
              <span className={styles.required}> Required</span>
            )}
          </span>
        </legend>
        {question.hint && <p className={styles.hint}>{question.hint}</p>}
        <div className={styles.options}>
          {question.options.map((option) => {
            const checked = isMulti
              ? (selectedValue || []).includes(option)
              : selectedValue === option;
            const optionSlug = option
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-');
            const optionId = `${question.id}-${optionSlug}`;
            const detailAnswerId = `${question.id}Detail-${optionSlug}`;
            const detailFieldId = `question-${detailAnswerId}`;

            const optionControl = (
              <label
                className={`${styles.option} ${
                  checked ? styles.optionSelected : ''
                }`}
                htmlFor={optionId}>
                <input
                  id={optionId}
                  type={isMulti ? 'checkbox' : 'radio'}
                  name={question.id}
                  checked={checked}
                  onChange={() =>
                    isMulti
                      ? toggleMultiAnswer(
                          question.id,
                          option,
                          question.captureOptionDetails
                            ? detailAnswerId
                            : null,
                        )
                      : updateAnswer(question.id, option)
                  }
                />
                <span>{option}</span>
              </label>
            );

            if (!question.captureOptionDetails) {
              return <div key={option}>{optionControl}</div>;
            }

            return (
              <div className={styles.optionGroup} key={option}>
                {optionControl}
                {checked && option !== 'Other' && (
                  <label
                    className={styles.optionDetail}
                    htmlFor={detailFieldId}>
                    <span>{question.optionDetailLabel}</span>
                    <input
                      id={detailFieldId}
                      type="text"
                      value={formState.answers[detailAnswerId] || ''}
                      placeholder={question.optionDetailPlaceholder}
                      onChange={(event) =>
                        updateAnswer(detailAnswerId, event.target.value)
                      }
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
        {renderOtherInput(question)}
      </fieldset>
    );
  }

  return (
    <form className={styles.questionnaire} onSubmit={saveDraft}>
      <section className={styles.overview} aria-labelledby="workshop-details">
        <div>
          <p className={styles.eyebrow}>Workshop record</p>
          <h2 id="workshop-details">Discovery questionnaire</h2>
          <p>
            Capture evidence, decisions, and unknowns before solution design
            begins.
          </p>
        </div>
        <div className={styles.progressPanel}>
          <div className={styles.progressHeading}>
            <strong>{progress}%</strong>
            <span>
              {answeredRequired} of {requiredQuestions.length} key questions
            </span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            aria-label="Required-question progress">
            <span style={{width: `${progress}%`}} />
          </div>
        </div>
      </section>

      <section className={styles.workshopFields}>
        <label>
          <span>Workshop name</span>
          <input
            type="text"
            value={formState.workshop.name}
            placeholder="Accommodation discovery — session 1"
            onChange={(event) => updateWorkshop('name', event.target.value)}
          />
        </label>
        <label>
          <span>Client</span>
          <input
            type="text"
            value={formState.workshop.client}
            onChange={(event) => updateWorkshop('client', event.target.value)}
          />
        </label>
        <label>
          <span>Workshop date</span>
          <input
            type="date"
            value={formState.workshop.date}
            onChange={(event) => updateWorkshop('date', event.target.value)}
          />
        </label>
        <label>
          <span>Facilitator</span>
          <input
            type="text"
            value={formState.workshop.facilitator}
            placeholder="Name"
            onChange={(event) =>
              updateWorkshop('facilitator', event.target.value)
            }
          />
        </label>
      </section>

      <div className={styles.sections}>
        {questionnaireSections.map((section, sectionIndex) => (
          <details
            className={styles.section}
            defaultOpen={sectionIndex === 0}
            key={section.id}>
            <summary>
              <span className={styles.sectionNumber}>{section.number}</span>
              <span className={styles.sectionIdentity}>
                <strong>{section.title}</strong>
                <span>{section.description}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true" />
            </summary>
            <div className={styles.sectionBody}>
              {section.questions.map(renderQuestion)}
            </div>
          </details>
        ))}
      </div>

      <div className={styles.actionBar}>
        <div
          className={`${styles.status} ${styles[status.tone]}`}
          role="status"
          aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>
            {status.message}
            {savedAt && dirty && (
              <small> Last saved {formatSavedTime(savedAt)}.</small>
            )}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.clearButton}
            type="button"
            onClick={clearDraft}>
            Clear
          </button>
          <button
            className={styles.exportButton}
            type="button"
            onClick={downloadAnswers}>
            Download JSON
          </button>
          <button className={styles.saveButton} type="submit">
            Save answers
          </button>
        </div>
      </div>
    </form>
  );
}
