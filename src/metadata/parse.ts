import exifr from 'exifr';

export interface MetadataEntry {
  key: string;
  value: string;
}

export interface MetadataCategory {
  name: string;
  entries: MetadataEntry[];
}

export interface ParsedMetadata {
  categories: MetadataCategory[];
  hasMetadata: boolean;
  raw: Record<string, unknown>;
}

const CAMERA_TAGS = [
  'Make',
  'Model',
  'LensModel',
  'LensMake',
  'BodySerialNumber',
  'LensSerialNumber',
  'CameraOwnerName',
  'SerialNumber',
  'InternalSerialNumber',
];

const SETTINGS_TAGS = [
  'FNumber',
  'ApertureValue',
  'ExposureTime',
  'ShutterSpeedValue',
  'ISO',
  'FocalLength',
  'FocalLengthIn35mmFormat',
  'Flash',
  'ExposureProgram',
  'MeteringMode',
  'WhiteBalance',
  'ExposureCompensation',
  'ExposureMode',
  'SceneCaptureType',
  'LightSource',
  'Contrast',
  'Saturation',
  'Sharpness',
];

const DATE_TAGS = [
  'DateTimeOriginal',
  'CreateDate',
  'ModifyDate',
  'OffsetTime',
  'OffsetTimeOriginal',
  'OffsetTimeDigitized',
  'SubSecTimeOriginal',
  'SubSecTimeDigitized',
  'DateCreated',
  'DateTime',
  'DateTimeDigitized',
  'GPSDateStamp',
];

const GPS_TAGS = [
  'GPSLatitude',
  'GPSLongitude',
  'GPSLatitudeRef',
  'GPSLongitudeRef',
  'GPSAltitude',
  'GPSAltitudeRef',
  'GPSImgDirection',
  'GPSImgDirectionRef',
  'GPSSpeed',
  'GPSSpeedRef',
  'GPSDestBearing',
  'GPSDestBearingRef',
  'GPSTimeStamp',
  'GPSProcessingMethod',
  'GPSAreaInformation',
  'GPSSatellites',
  'GPSDOP',
  'GPSMeasureMode',
  'GPSMapDatum',
  'GPSHPositioningError',
];

const SOFTWARE_TAGS = [
  'Software',
  'HostComputer',
  'ProcessingSoftware',
  'Artist',
  'Copyright',
  'ImageDescription',
  'UserComment',
  'DocumentName',
  'XPAuthor',
  'XPComment',
  'XPKeywords',
  'XPSubject',
  'XPTitle',
  'Title',
  'Description',
  'Creator',
  'Rights',
];

const IMAGE_TAGS = [
  'ImageWidth',
  'ImageHeight',
  'Orientation',
  'ColorSpace',
  'Compression',
  'BitsPerSample',
  'PhotometricInterpretation',
  'SamplesPerPixel',
  'PlanarConfiguration',
  'YCbCrPositioning',
  'YCbCrSubSampling',
  'ResolutionUnit',
  'XResolution',
  'YResolution',
  'ThumbnailLength',
  'ThumbnailOffset',
];

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export async function parseMetadata(file: File): Promise<ParsedMetadata> {
  const buffer = await file.arrayBuffer();
  const data = await exifr.parse(buffer, {
    tiff: true,
    xmp: true,
    iptc: true,
    icc: true,
    jfif: true,
  });

  if (!data || Object.keys(data).length === 0) {
    return { categories: [], hasMetadata: false, raw: {} };
  }

  const raw = { ...data } as Record<string, unknown>;
  const categories: MetadataCategory[] = [];

  const addCategory = (name: string, tagList: string[]) => {
    const entries: MetadataEntry[] = [];
    for (const tag of tagList) {
      if (tag in raw) {
        entries.push({ key: tag, value: stringifyValue(raw[tag]) });
        delete raw[tag];
      }
    }
    if (entries.length > 0) {
      categories.push({ name, entries });
    }
  };

  addCategory('Camera', CAMERA_TAGS);
  addCategory('Settings', SETTINGS_TAGS);
  addCategory('Date & Time', DATE_TAGS);
  addCategory('GPS / Location', GPS_TAGS);
  addCategory('Software & Copyright', SOFTWARE_TAGS);
  addCategory('Image', IMAGE_TAGS);

  const remaining = Object.entries(raw).filter(([, v]) => v !== undefined && v !== null);
  if (remaining.length > 0) {
    categories.push({
      name: 'Other',
      entries: remaining.map(([key, value]) => ({
        key,
        value: stringifyValue(value),
      })),
    });
  }

  return {
    categories,
    hasMetadata: categories.length > 0,
    raw: data as Record<string, unknown>,
  };
}

export interface FileInfo {
  name: string;
  size: string;
  type: string;
  lastModified: string;
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: formatSize(file.size),
    type: file.type || 'unknown',
    lastModified: new Date(file.lastModified).toISOString(),
  };
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const SUPPORTED_PARSE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/webp',
  'image/avif',
];

export const SUPPORTED_STRIP_TYPES = ['image/jpeg', 'image/png'];
