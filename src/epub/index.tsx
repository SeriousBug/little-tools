import { create } from 'zustand';
import { useCallback, useEffect, useRef, useState } from 'react';
import { css } from '@styled-system/css';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { TextInput } from '../components/TextInput';
import { EpubDocument, Chapter } from './parser';

const LOAD_HEADINGS_TOOLTIP =
  'Find the first heading in each chapter and set it as the chapter name.';

type Status = 'idle' | 'loading' | 'loaded' | 'saving' | 'loading-headings';

interface State {
  doc: EpubDocument | null;
  chapters: Chapter[];
  filename: string;
  status: Status;
  error: string | null;

  loadFile: (file: File) => Promise<void>;
  updateChapterTitle: (id: string, title: string) => void;
  saveEpub: () => Promise<void>;
  loadFromHeadings: () => Promise<void>;
  reset: () => void;
}

function isEpubFile(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.epub') ||
    file.type === 'application/epub+zip' ||
    file.type === 'application/zip'
  );
}

function replaceExtension(filename: string, suffix: string): string {
  const lastDot = filename.lastIndexOf('.');
  const base = lastDot === -1 ? filename : filename.substring(0, lastDot);
  return `${base}${suffix}.epub`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const useEpubStore = create<State>((set, get) => ({
  doc: null,
  chapters: [],
  filename: '',
  status: 'idle',
  error: null,

  loadFile: async (file: File) => {
    if (!isEpubFile(file)) {
      set({ error: 'Please select an EPUB file (.epub)', status: 'idle' });
      return;
    }
    set({ status: 'loading', error: null });
    try {
      const doc = await EpubDocument.load(file, file.name);
      set({
        doc,
        chapters: [...doc.chapters],
        filename: file.name,
        status: 'loaded',
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ status: 'idle', error: `Failed to load EPUB: ${msg}` });
    }
  },

  updateChapterTitle: (id, title) => {
    set((state) => ({
      chapters: state.chapters.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  saveEpub: async () => {
    const { doc, chapters, filename, status } = get();
    if (!doc || status !== 'loaded') return;
    set({ status: 'saving', error: null });
    try {
      const titles: Record<string, string> = {};
      for (const c of chapters) titles[c.id] = c.title;
      doc.applyTitles(titles);
      const blob = await doc.generateBlob();
      triggerDownload(blob, replaceExtension(filename, '-renamed'));
      set({ status: 'loaded' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ status: 'loaded', error: `Failed to save EPUB: ${msg}` });
    }
  },

  loadFromHeadings: async () => {
    const { doc, chapters, status } = get();
    if (!doc || status !== 'loaded') return;
    set({ status: 'loading-headings', error: null });
    try {
      const updated: Chapter[] = [];
      let foundAny = false;
      for (const c of chapters) {
        const heading = await doc.getChapterHeading(c.id);
        if (heading && heading.length > 0) {
          updated.push({ ...c, title: heading });
          foundAny = true;
        } else {
          updated.push(c);
        }
      }
      set({
        chapters: updated,
        status: 'loaded',
        error: foundAny ? null : 'No headings could be found in the chapter content.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ status: 'loaded', error: `Failed to load chapter headings: ${msg}` });
    }
  },

  reset: () => {
    set({ doc: null, chapters: [], filename: '', status: 'idle', error: null });
  },
}));

function Spinner() {
  return (
    <div
      className={css({
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid',
        borderColor: 'currentColor',
        borderTopColor: 'transparent',
        borderRadius: 'full',
        animation: 'spin 0.8s linear infinite',
      })}
      aria-label="loading"
    />
  );
}

function DropZone({ onFile, disabled }: { onFile: (file: File) => void; disabled: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={css({
        border: '2px dashed',
        borderColor: 'border',
        borderRadius: 'md',
        backgroundColor: 'bg.subtle',
        p: '8',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.18s ease, border-color 0.18s ease',
        _hover: disabled ? {} : { backgroundColor: 'bg.panel', borderColor: 'accent' },
      })}
    >
      <p className={css({ mb: '2', fontWeight: 'medium' })}>
        Drop an EPUB file here or click to select
      </p>
      <p className={css({ fontSize: 'sm', color: 'fg.muted' })}>Files stay on your device.</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".epub,application/epub+zip"
        onChange={(e) => handleFiles(e.target.files)}
        className={css({ display: 'none' })}
      />
    </div>
  );
}

function ChapterRow({
  chapter,
  disabled,
  onChange,
}: {
  chapter: Chapter;
  disabled: boolean;
  onChange: (id: string, title: string) => void;
}) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        gap: '1',
      })}
    >
      <TextInput
        value={chapter.title}
        disabled={disabled}
        onChange={(e) => onChange(chapter.id, e.target.value)}
        aria-label={`Chapter title for ${chapter.href}`}
      />
      <span
        className={css({
          fontSize: 'xs',
          color: 'fg.muted',
          fontFamily: 'mono',
          wordBreak: 'break-all',
        })}
      >
        {chapter.href}
      </span>
    </div>
  );
}

function LoadHeadingsButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const showDelayed = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setOpen(true), 1000);
  }, [clearTimer]);

  const showImmediate = useCallback(() => {
    clearTimer();
    setOpen(true);
  }, [clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <span className={css({ position: 'relative', display: 'inline-flex' })}>
      <Button
        variant="secondary"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Load from Chapter Headings. ${LOAD_HEADINGS_TOOLTIP}`}
        aria-describedby={open ? 'load-headings-tooltip' : undefined}
        onMouseEnter={showDelayed}
        onMouseLeave={hide}
        onFocus={showImmediate}
        onBlur={hide}
      >
        {loading ? (
          <span className={css({ display: 'inline-flex', alignItems: 'center', gap: '2' })}>
            <Spinner /> Reading headings...
          </span>
        ) : (
          <span className={css({ display: 'inline-flex', alignItems: 'center', gap: '1.5' })}>
            Load from Chapter Headings
            <span
              onMouseEnter={showImmediate}
              className={css({ display: 'inline-flex', alignItems: 'center' })}
            >
              <Icon name="question" size="14px" />
            </span>
          </span>
        )}
      </Button>
      {open && (
        <span
          role="tooltip"
          id="load-headings-tooltip"
          className={css({
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'fg',
            color: 'bg.panel',
            fontSize: 'xs',
            lineHeight: 'short',
            px: '2',
            py: '1',
            borderRadius: 'sm',
            boxShadow: 'sm',
            whiteSpace: 'normal',
            maxW: '260px',
            width: 'max-content',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          })}
        >
          {LOAD_HEADINGS_TOOLTIP}
        </span>
      )}
    </span>
  );
}

export function EpubPage() {
  const doc = useEpubStore((s) => s.doc);
  const chapters = useEpubStore((s) => s.chapters);
  const filename = useEpubStore((s) => s.filename);
  const status = useEpubStore((s) => s.status);
  const error = useEpubStore((s) => s.error);
  const loadFile = useEpubStore((s) => s.loadFile);
  const updateChapterTitle = useEpubStore((s) => s.updateChapterTitle);
  const saveEpub = useEpubStore((s) => s.saveEpub);
  const loadFromHeadings = useEpubStore((s) => s.loadFromHeadings);
  const reset = useEpubStore((s) => s.reset);

  const isBusy = status === 'loading' || status === 'saving' || status === 'loading-headings';
  const isLoaded = doc !== null && (status === 'loaded' || isBusy);

  return (
    <div
      className={css({
        maxW: '800px',
        width: '100%',
        mx: 'auto',
        p: '6',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'border',
        backgroundColor: 'bg.panel',
        color: 'fg',
        boxShadow: 'sm',
        display: 'flex',
        flexDir: 'column',
        gap: '4',
      })}
    >
      <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2', color: 'fg' })}>
        EPUB Chapter Renamer
      </h2>
      <p className={css({ mb: '2', color: 'fg.muted' })}>
        Edit the table of contents in an EPUB file. Load an EPUB, rename chapters, then save a new
        copy. All processing happens in your browser.
      </p>

      {!isLoaded && <DropZone onFile={loadFile} disabled={isBusy} />}

      {status === 'loading' && (
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
          <Spinner /> <span>Loading EPUB...</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className={css({
            p: '3',
            border: '1px solid',
            borderColor: 'red.500',
            color: 'red.600',
            borderRadius: 'md',
          })}
        >
          {error}
        </div>
      )}

      {isLoaded && (
        <>
          <div>
            <div className={css({ fontWeight: 'medium' })}>File:</div>
            <div className={css({ fontFamily: 'mono', fontSize: 'sm' })}>{filename}</div>
          </div>
          <div
            className={css({
              display: 'flex',
              flexDir: 'row',
              alignItems: 'center',
              gap: '2',
              flexWrap: 'wrap',
            })}
          >
            <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
              <Button onClick={saveEpub} disabled={isBusy}>
                {status === 'saving' ? (
                  <span className={css({ display: 'inline-flex', alignItems: 'center', gap: '2' })}>
                    <Spinner /> Saving...
                  </span>
                ) : (
                  'Save EPUB'
                )}
              </Button>
              <LoadHeadingsButton
                onClick={loadFromHeadings}
                disabled={isBusy}
                loading={status === 'loading-headings'}
              />
            </div>
            <Button
              variant="secondary"
              onClick={reset}
              disabled={isBusy}
              className={css({ ml: 'auto' })}
            >
              Load Different File
            </Button>
          </div>

          <div>
            <h3
              className={css({
                fontSize: 'lg',
                fontWeight: 'semibold',
                mb: '2',
              })}
            >
              Chapters ({chapters.length})
            </h3>
            <div
              className={css({
                display: 'flex',
                flexDir: 'column',
                gap: '3',
              })}
            >
              {chapters.map((c) => (
                <ChapterRow
                  key={c.id}
                  chapter={c}
                  disabled={isBusy}
                  onChange={updateChapterTitle}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
