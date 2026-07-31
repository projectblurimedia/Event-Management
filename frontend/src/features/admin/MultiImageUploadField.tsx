import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';
import { useUploadImage, useDeleteUpload, useUploadUsage } from '@/lib/api/uploads';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { isVideoUrl, extractCloudinaryPublicId } from '@/lib/cloudinary';

const MAX_IMAGES = 4;

interface MultiImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function MultiImageUploadField({ value, onChange }: MultiImageUploadFieldProps) {
  const { t } = useTranslation();
  const upload = useUploadImage();
  const deleteUpload = useDeleteUpload();
  const { data: usage } = useUploadUsage();
  const atLimit = value.length >= MAX_IMAGES;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (atLimit) return;
    try {
      const result = await upload.mutateAsync(file);
      onChange([...value, result.url]);
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.imageUploadFailed')));
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
              className="hidden"
              disabled={upload.isPending}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}
      </div>
      <p className="text-text-muted mt-1.5 text-xs">
        {value.length}/{MAX_IMAGES} {t('admin.imagesUploaded')}
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
