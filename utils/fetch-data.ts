import ky from "ky";

const fetchData = async (urlPath: string) => {
  const response = await ky.get(urlPath).json();
  console.log("fetchData", response);
  return response;
};

export default fetchData;
