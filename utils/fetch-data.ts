import ky from "ky";

const fetchLinkData = async (endpoint: string) => {
  const response = await ky.get(endpoint).json();
  return response;
};

export default fetchLinkData;
