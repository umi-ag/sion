'use client';

import { File } from 'src/types';
import useSWR from 'swr';
import { OauthState, useOauth } from './oauth';

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

const uploadFile = async (file: File, accessToken: string) => {
  const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=media&key=${API_KEY}`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(file),
  });

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  console.log(json);
};

const uploadFile2 = async (accessToken: string) => {
  // バウンダリ文字列を定義
  const boundary = '-------314159265358979323846';

  // メタデータを定義
  const metadata = {
    name: 'ohayo', // ファイル名
    mimeType: 'text/plain', // MIMEタイプ
  };

  // ファイルの中身
  const content = 'おはよう';
  const blob = new Blob([content], { type: 'text/plain' });

  // リクエストボディを構築
  let requestBody = '';
  requestBody += `--${boundary}\r\n`;
  requestBody += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
  requestBody += `${JSON.stringify(metadata)}\r\n`;
  requestBody += `--${boundary}\r\n`;
  requestBody += `Content-Type: ${blob.type}\r\n\r\n`;
  requestBody += `${content}\r\n`;
  requestBody += `--${boundary}--`;

  // fetch APIを使ってリクエストを送信
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: requestBody,
  });
  // .then((response) => response.json())
  // .then((data) => console.log(data))
  // .catch((error) => console.error('Error:', error));

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  console.log(json);
};

export const useFiles = (oauth: OauthState) => {
  const shouldFetch = !!oauth.accessToken;
  const key = shouldFetch ? ['gdrive-list-files', oauth.accessToken] : null;
  const { data, ...rest } = useSWR(key, ([_, accessToken]) => listFiles(accessToken));

  return {
    files: data ?? [],
    ...rest,
  };
};

export const useGdrive = () => {
  const { oauth } = useOauth();

  return {
    useFiles: () => useFiles(oauth),
    uploadFile: (file: File) => uploadFile(file, oauth.accessToken),
    uploadFile2: () => uploadFile2(oauth.accessToken),
  };
};
