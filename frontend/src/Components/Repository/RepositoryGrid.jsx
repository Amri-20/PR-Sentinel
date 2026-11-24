import RepositoryCard from "./RepositoryCard";

function RepositoryGrid({ repositories, onOpen }) {
  if (repositories.length === 0)
    return (
      <div className="surface-muted rounded-lg px-6 py-14 text-center">
        <p className="text-sm font-medium text-slate-300">No repositories available</p>
        <p className="mt-1 text-sm text-slate-500">No accessible public repositories were found for this account.</p>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {repositories.map((repository) => (
        <RepositoryCard
          key={repository.id}
          repository={repository}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

export default RepositoryGrid;
