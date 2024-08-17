import ky from "ky";

const fetchLinkData = async (path: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/${path}`;
  const response = await ky.get(endpoint).json();
  return response;
};

export default fetchLinkData;
