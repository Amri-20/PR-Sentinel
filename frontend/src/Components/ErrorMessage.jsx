function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-lg border border-rose-400/25 bg-rose-400/8 px-4 py-3 text-sm text-rose-200" role="alert">
      <span className="mr-2 font-semibold text-rose-300">Unable to continue.</span>{message}
    </div>
  );
}

export default ErrorMessage;
