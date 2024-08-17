import ky from "ky";

const fetchLinkData = async (path: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
  const response = await ky.get(endpoint).json();
  return response;
};

export default fetchLinkData;
