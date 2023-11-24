'use client';

import { File } from 'src/types';
import useSWR from 'swr';
import { useOauth } from './oauth';

// export type GdriveState = {
//   // gdrive
//   files: File[];
// };

const API_KEY = 'AIzaSyDII8ecl6Kzef3ccXh9XYt-kHIWWcFtbqk';

const listFiles = async (accessToken: string) => {
  const url = `https://www.googleapis.com/drive/v3/files?key=${API_KEY}`;
  // const accessToken = get().accessToken;

  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  // console.log(json);

  // set({ files: json.files });
  return json.files as File[];
};

export const useListFilesQuery = () => {
  const { oauth } = useOauth();

  const shouldFetch = !!oauth.accessToken;
  const key = shouldFetch ? ['gdrive-list-files', oauth.accessToken] : null;
  const { data, ...rest } = useSWR(key, ([_, accessToken]) => listFiles(accessToken));

  return {
    files: data ?? [],
    ...rest,
  };
};

export const useGdrive = () => {
  return {
    listFilesQuery: useListFilesQuery(),
  };
};
