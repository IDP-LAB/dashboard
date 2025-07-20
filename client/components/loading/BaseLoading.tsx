export default function BaseLoading() {
  return (
    <div className="flex h-screen items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
        <p className="text-lg">Carregando...</p>
      </div>
    </div>
  );
}