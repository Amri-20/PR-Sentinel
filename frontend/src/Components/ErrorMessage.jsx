function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">{message}</div>;
}

export default ErrorMessage;
