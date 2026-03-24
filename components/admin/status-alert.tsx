type StatusAlertProps = {
  status?: string;
  error?: string;
};

export function StatusAlert({ status, error }: StatusAlertProps) {
  if (!status && !error) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      Perubahan berhasil diproses.
    </div>
  );
}
