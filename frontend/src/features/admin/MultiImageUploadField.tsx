import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';
import { useUploadImage, useDeleteUpload, useUploadUsage } from '@/lib/api/uploads';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { isVideoUrl, extractCloudinaryPublicId } from '@/lib/cloudinary';

const DEFAULT_MAX_IMAGES = 4;

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  /** Defaults to 4 (catalog item galleries); business intro uses more. */
  maxImages?: number;
}

export function MultiImageUploadField({ value, onChange, maxImages = DEFAULT_MAX_IMAGES }: MultiImageUploadFieldProps) {
  const { t } = useTranslation();
  const upload = useUploadImage();
  const deleteUpload = useDeleteUpload();
  const { data: usage } = useUploadUsage();
  const atLimit = value.length >= maxImages;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Uploads happen one at a time (not Promise.all) so `value` stays
    // consistent across awaits instead of every upload racing off the same
    // stale array and clobbering each other's result.
    let current = value;
    const room = maxImages - current.length;
    const toUpload = Array.from(files).slice(0, room);
    for (const file of toUpload) {
      try {
        const result = await upload.mutateAsync(file);
        current = [...current, result.url];
        onChange(current);
      } catch (error) {
        toast.error(getErrorMessage(error, t('errors.imageUploadFailed')));
      }
    }
  }

  function removeAt(index: number) {
    const removedUrl = value[index]!;
    onChange(value.filter((_, i) => i !== index));
    // Free up the Cloudinary asset (and its video slot, if it was one) —
    // otherwise removing a video from an item wouldn't actually free the
    // sitewide cap back up.
    const publicId = extractCloudinaryPublicId(removedUrl);
    if (publicId) deleteUpload.mutate(publicId);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {value.map((url, i) => (
          <div key={url} className="relative">
            {isVideoUrl(url) ? (
              <video src={url} className="h-14 w-20 rounded-lg object-cover" muted />
            ) : (
              <img src={url} alt="" className="h-14 w-14 rounded-lg object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={t('admin.removeImage')}
              className="bg-ink-black text-cream absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {!atLimit && (
          <label className="border-border hover:border-gold text-text-muted flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center text-[10px]">
            {upload.isPending ? (
              t('admin.uploading')
            ) : (
              <>
                <UploadCloud size={16} />
                {t('admin.addImage')}
              </>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              disabled={upload.isPending}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-text-muted mt-1.5 text-xs">
        {value.length}/{maxImages} {t('admin.imagesUploaded')}
        {usage && (
          <>
            {' · '}
            {t('admin.videoUsageHint')} {usage.videoCount}/{usage.videoLimit}
          </>
        )}
      </p>
    </div>
  );
}
