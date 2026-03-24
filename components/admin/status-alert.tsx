type StatusAlertProps = {
  status?: string;
  error?: string;
};

export function StatusAlert({ status, error }: StatusAlertProps) {
  if (!status && !error) {
    return null;
  }

  if (error) {
    return <div className="admin-alert admin-alert-error">{error}</div>;
  }

  return <div className="admin-alert admin-alert-success">Perubahan berhasil diproses.</div>;
}
