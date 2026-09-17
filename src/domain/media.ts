import { inferMediaKind, inferMediaRole, type MediaAsset, type MediaRole } from './workflow'

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`
}

export const fileToMediaAsset = (file: File, role?: MediaRole): MediaAsset => {
  const kind = inferMediaKind(file.type, file.name)
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    url: URL.createObjectURL(file),
    durationLabel: kind === 'image' ? 'Image' : kind === 'audio' ? 'Audio' : 'Local video',
    kind,
    role: role ?? inferMediaRole(kind, file.name),
    mimeType: file.type,
    sizeLabel: formatBytes(file.size),
  }
}

export const filesToMediaAssets = (files: FileList | File[]) => Array.from(files).map((file) => fileToMediaAsset(file))
