import { useState, useCallback, useRef, ChangeEvent, DragEvent } from 'react';
import { css } from '@styled-system/css';
import { Button } from '../components/Button';
import {
  parseMetadata,
  getFileInfo,
  ParsedMetadata,
  FileInfo,
  formatSize,
  SUPPORTED_STRIP_TYPES,
} from './parse';
import { stripMetadata } from './strip';

interface StrippedResult {
  blob: Blob;
  size: number;
}

export function MetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stripping, setStripping] = useState(false);
  const [stripped, setStripped] = useState<StrippedResult | null>(null);
  const [strippedPreviewUrl, setStrippedPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    if (strippedPreviewUrl) URL.revokeObjectURL(strippedPreviewUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMetadata(null);
    setFileInfo(null);
    setError(null);
    setStripped(null);
    setStrippedPreviewUrl(null);
  }, [strippedPreviewUrl, previewUrl]);

  const handleFile = useCallback(
    async (f: File) => {
      resetState();
      setFile(f);
      setLoading(true);

      const url = URL.createObjectURL(f);
      setPreviewUrl(url);

      const info = getFileInfo(f);
      setFileInfo(info);

      try {
        const meta = await parseMetadata(f);
        setMetadata(meta);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Failed to parse metadata: ${msg}`);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    },
    [resetState]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  const handleStrip = useCallback(async () => {
    if (!file) return;
    setStripping(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();

      if (!SUPPORTED_STRIP_TYPES.includes(file.type)) {
        setError(
          `Metadata stripping is not supported for ${file.type || 'this file type'} yet. Try JPEG or PNG.`
        );
        setStripping(false);
        return;
      }

      const clean = stripMetadata(buffer, file.type);
      const blob = new Blob([clean], { type: file.type });
      const cleanUrl = URL.createObjectURL(blob);
      setStrippedPreviewUrl(cleanUrl);
      setStripped({ blob, size: clean.byteLength });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Failed to strip metadata: ${msg}`);
    } finally {
      setStripping(false);
    }
  }, [file]);

  const handleDownload = useCallback(() => {
    if (!stripped || !file) return;
    const url = URL.createObjectURL(stripped.blob);
    const a = document.createElement('a');
    a.href = url;
    const dot = file.name.lastIndexOf('.');
    const cleanName =
      dot >= 0 ? `${file.name.slice(0, dot)}-clean${file.name.slice(dot)}` : `${file.name}-clean`;
    a.download = cleanName;
    a.click();
    URL.revokeObjectURL(url);
  }, [stripped, file]);

  const handleReset = useCallback(() => {
    resetState();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [resetState]);

  const stripSupported = file ? SUPPORTED_STRIP_TYPES.includes(file.type) : false;

  return (
    <div
      className={css({
        maxW: '900px',
        width: '100%',
        mx: 'auto',
        display: 'flex',
        flexDir: 'column',
        gap: '5',
      })}
    >
      <div
        className={css({
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
        <h2
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'fg',
          })}
        >
          Metadata Scrubber
        </h2>
        <p className={css({ color: 'fg.muted' })}>
          See what personal data your photos are leaking — GPS coordinates, camera model, timestamps
          — then strip it all with one click. Everything happens in your browser; nothing is
          uploaded.
        </p>

        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={css({
              border: '2px dashed',
              borderColor: dragOver ? 'accent' : 'border',
              borderRadius: 'lg',
              p: '10',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.18s ease, background-color 0.18s ease',
              backgroundColor: dragOver ? 'bg.subtle' : 'transparent',
              _hover: { borderColor: 'accent' },
            })}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className={css({ display: 'none' })}
            />
            <p className={css({ color: 'fg.muted', fontSize: 'lg' })}>
              Drop an image here or click to browse
            </p>
            <p className={css({ color: 'fg.muted', fontSize: 'sm', mt: '2' })}>
              JPEG, PNG, HEIC, TIFF, WebP — metadata parsing for all • stripping for JPEG & PNG
            </p>
          </div>
        )}

        {error && (
          <div
            className={css({
              p: '4',
              borderRadius: 'md',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              _dark: { backgroundColor: '#451a1a', color: '#fca5a5' },
              fontSize: 'sm',
            })}
          >
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div
          className={css({
            p: '6',
            borderRadius: 'lg',
            border: '1px solid',
            borderColor: 'border',
            backgroundColor: 'bg.panel',
            color: 'fg.muted',
            textAlign: 'center',
          })}
        >
          Parsing metadata...
        </div>
      )}

      {file && !loading && (
        <div
          className={css({
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
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '3',
            })}
          >
            <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>File Info</h3>
            <div className={css({ display: 'flex', gap: '2' })}>
              {metadata?.hasMetadata && (
                <Button
                  onClick={handleStrip}
                  disabled={stripping || !stripSupported}
                  title={!stripSupported ? 'Stripping supported for JPEG and PNG only' : undefined}
                >
                  {stripping
                    ? 'Stripping...'
                    : !stripSupported
                      ? 'Strip (JPEG/PNG only)'
                      : 'Strip Metadata'}
                </Button>
              )}
              <Button variant="secondary" onClick={handleReset}>
                Clear
              </Button>
            </div>
          </div>

          <div
            className={css({
              display: 'flex',
              gap: '5',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            })}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className={css({
                  maxW: '200px',
                  maxH: '200px',
                  borderRadius: 'md',
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'border',
                })}
              />
            )}
            <div
              className={css({
                display: 'flex',
                flexDir: 'column',
                gap: '1',
                fontSize: 'sm',
              })}
            >
              <p>
                <span className={css({ color: 'fg.muted' })}>Name: </span>
                {fileInfo?.name}
              </p>
              <p>
                <span className={css({ color: 'fg.muted' })}>Size: </span>
                {fileInfo?.size}
              </p>
              <p>
                <span className={css({ color: 'fg.muted' })}>Type: </span>
                {fileInfo?.type}
              </p>
              {!stripSupported && (
                <p className={css({ color: 'fg.muted', fontStyle: 'italic', mt: '1' })}>
                  Metadata can be viewed but stripping is only supported for JPEG and PNG images.
                </p>
              )}
            </div>
          </div>

          {metadata && !metadata.hasMetadata && (
            <p className={css({ color: 'accent.secondary', fontWeight: 'medium' })}>
              No metadata found in this file — your photo is already clean!
            </p>
          )}

          {metadata?.hasMetadata && (
            <div className={css({ display: 'flex', flexDir: 'column', gap: '5' })}>
              {metadata.categories.map((cat) => (
                <div key={cat.name}>
                  <h4
                    className={css({
                      fontSize: 'md',
                      fontWeight: 'semibold',
                      mb: '2',
                      color: 'fg',
                    })}
                  >
                    {cat.name}
                  </h4>
                  <div
                    className={css({
                      borderRadius: 'md',
                      border: '1px solid',
                      borderColor: 'border',
                      overflow: 'hidden',
                    })}
                  >
                    <table
                      className={css({
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 'sm',
                      })}
                    >
                      <tbody>
                        {cat.entries.map((entry, i) => (
                          <tr
                            key={entry.key}
                            className={css({
                              backgroundColor: i % 2 === 0 ? 'transparent' : 'bg.subtle',
                            })}
                          >
                            <td
                              className={css({
                                px: '3',
                                py: '2',
                                color: 'fg.muted',
                                fontWeight: 'medium',
                                whiteSpace: 'nowrap',
                                width: '40%',
                                borderBottom: '1px solid',
                                borderColor: 'border',
                              })}
                            >
                              {entry.key}
                            </td>
                            <td
                              className={css({
                                px: '3',
                                py: '2',
                                color: 'fg',
                                wordBreak: 'break-all',
                                borderBottom: '1px solid',
                                borderColor: 'border',
                              })}
                            >
                              {entry.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stripped && (
        <div
          className={css({
            p: '6',
            borderRadius: 'lg',
            border: '2px solid',
            borderColor: 'accent.secondary',
            backgroundColor: 'bg.panel',
            color: 'fg',
            boxShadow: 'sm',
            display: 'flex',
            flexDir: 'column',
            gap: '4',
          })}
        >
          <h3
            className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'accent.secondary' })}
          >
            Metadata Stripped Successfully
          </h3>

          <div
            className={css({
              display: 'flex',
              gap: '5',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            })}
          >
            {strippedPreviewUrl && (
              <img
                src={strippedPreviewUrl}
                alt="Cleaned preview"
                className={css({
                  maxW: '200px',
                  maxH: '200px',
                  borderRadius: 'md',
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'border',
                })}
              />
            )}
            <div className={css({ display: 'flex', flexDir: 'column', gap: '2', fontSize: 'sm' })}>
              <p>
                <span className={css({ color: 'fg.muted' })}>Original size: </span>
                {file && formatSize(file.size)}
              </p>
              <p>
                <span className={css({ color: 'fg.muted' })}>Clean size: </span>
                {formatSize(stripped.size)}
              </p>
              <p>
                <span className={css({ color: 'fg.muted' })}>Saved: </span>
                {file && formatSize(file.size - stripped.size)}
              </p>
            </div>
          </div>

          <Button onClick={handleDownload}>Download Clean File</Button>
        </div>
      )}
    </div>
  );
}
