import RepositoryCard from "./RepositoryCard";

function RepositoryGrid({ repositories, onOpen }) {
  if (repositories.length === 0) return <p className="text-zinc-400 text-center py-16">No accessible public repositories found.</p>;
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{repositories.map((repository) => <RepositoryCard key={repository.id} repository={repository} onOpen={onOpen} />)}</div>;
}

export default RepositoryGrid;
