const StatsBadge = ({ clicks }) => {
  const color =
    clicks === 0
      ? "bg-gray-800 text-gray-500"
      : clicks < 10
        ? "bg-blue-900/50 text-blue-400"
        : clicks < 100
          ? "bg-indigo-900/50 text-indigo-400"
          : "bg-green-900/50 text-green-400";

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {clicks} {clicks === 1 ? "click" : "clicks"}
    </span>
  );
};

export default StatsBadge;
