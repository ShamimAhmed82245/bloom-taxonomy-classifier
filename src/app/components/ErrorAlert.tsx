import React from "react";

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      <span className="block sm:inline">{error}</span>
      <button
        onClick={onDismiss}
        className="absolute top-0 right-0 px-4 py-3"
        aria-label="Close alert"
      >
        <span className="text-red-500 hover:text-red-700">×</span>
      </button>
    </div>
  );
};

export default ErrorAlert;
