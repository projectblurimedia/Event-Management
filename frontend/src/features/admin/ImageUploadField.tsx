import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { useUploadImage } from '@/lib/api/uploads';
import { getErrorMessage } from '@/lib/errorMessage';
import { useTranslation } from '@/hooks/useTranslation';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const { t } = useTranslation();
  const upload = useUploadImage();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
    } catch (error) {
      toast.error(getErrorMessage(error, t('errors.imageUploadFailed')));
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" />
      ) : (
        <div className="border-border bg-bg text-text-muted flex h-14 w-14 items-center justify-center rounded-lg border border-dashed">
          <UploadCloud size={18} />
        </div>
      )}
      <label className="border-border hover:border-gold flex-1 cursor-pointer rounded-lg border px-3 py-2.5 text-center text-xs">
        {upload.isPending ? t('admin.uploading') : t('admin.uploadImage')}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
