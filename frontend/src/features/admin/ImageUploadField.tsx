import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';
import { useUploadImage, useDeleteUpload, useUploadUsage } from '@/lib/api/uploads';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';
import { isVideoUrl, extractCloudinaryPublicId } from '@/lib/cloudinary';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** Logo/hero fields are image-only — video doesn't fit their small, fixed-aspect display slots. */
  allowVideo?: boolean;
}

export function ImageUploadField({ value, onChange, allowVideo = true }: ImageUploadFieldProps) {
  const { t } = useTranslation();
  const upload = useUploadImage();
  const deleteUpload = useDeleteUpload();
  const { data: usage } = useUploadUsage();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const previousValue = value;
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
      // Replacing an existing image/video — clean up the old Cloudinary
      // asset so it doesn't sit around burning storage/bandwidth quota.
      if (previousValue) {
        const previousPublicId = extractCloudinaryPublicId(previousValue);
        if (previousPublicId) deleteUpload.mutate(previousPublicId);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.imageUploadFailed')));
    }
  }

  function handleRemove() {
    const publicId = extractCloudinaryPublicId(value);
    if (publicId) deleteUpload.mutate(publicId);
    onChange('');
  }

  const isVideo = value ? isVideoUrl(value) : false;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            {isVideo ? (
              <video src={value} className="h-14 w-20 rounded-lg object-cover" muted />
            ) : (
              <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" />
            )}
            <button
              type="button"
              onClick={handleRemove}
              aria-label={t('admin.removeImage')}
              className="bg-ink-black text-cream absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div className="border-border bg-bg text-text-muted flex h-14 w-14 items-center justify-center rounded-lg border border-dashed">
            <UploadCloud size={18} />
          </div>
        )}
        <label className="border-border hover:border-gold flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-xs">
          {upload.isPending ? t('admin.uploading') : allowVideo ? t('admin.uploadImage') : t('admin.uploadImageOnly')}
          <input
            type="file"
            accept={allowVideo ? 'image/*,video/*' : 'image/*'}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {allowVideo && usage && (
        <p className="text-text-muted text-xs">
          {t('admin.videoUsageHint')} {usage.videoCount}/{usage.videoLimit}
        </p>
      )}
    </div>
  );
}
