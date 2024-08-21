import URLGenerator from "../components/URLGenerator";

const TablePage = (props: { redirectMap: Record<string, string> }) => {
  const { redirectMap } = props;
  const glnkUsername = process.env.REACT_APP_GLNK_USERNAME || "defaultUsername";

  const links = Object.entries(redirectMap).map(([key, value]) => {
    return {
      subpath: key,
      redirectLink: value,
    };
  });

  return (
    <div className="App container mx-auto p-4 bg-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Go Links -{" "}
          <a
            href={process.env.PUBLIC_URL}
            className="text-blue-500 hover:underline"
          >
            {glnkUsername}.glnk.dev
          </a>
        </h1>
        <p className="mt-2 text-lg">
          Easily manage your custom short links with{" "}
          <a href="https://glnk.dev" className="text-blue-500 hover:underline">
            glnk.dev
          </a>
          .<br />
          Get your custom URL before it's too late—register{" "}
          <a
            href="https://glnk.dev/register"
            className="text-blue-500 hover:underline"
          >
            here
          </a>{" "}
          now!
        </p>
      </header>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700 w-1/4">
              Subpath
            </th>
            <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">
              Redirect Link
            </th>
          </tr>
        </thead>
        <tbody className="text-left">
          {links.map(({ subpath, redirectLink }) => (
            <URLGenerator
              key={subpath}
              subpath={subpath}
              template={redirectLink}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePage;
