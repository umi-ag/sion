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

export type NewFile = {
  name: string;
  mimeType: string;
  content: string;
};

// バウンダリ文字列を定義
const BOUNDARY = '-------314159265358979323846';

const uploadFile = async ({ name, mimeType, content }: NewFile, accessToken: string) => {
  // メタデータを定義
  const metadata = {
    name, // ファイル名
    mimeType, // MIMEタイプ
  };

  // ファイルの中身
  const blob = new Blob([content], { type: mimeType });

  // リクエストボディを構築
  let requestBody = '';
  requestBody += `--${BOUNDARY}\r\n`;
  requestBody += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
  requestBody += `${JSON.stringify(metadata)}\r\n`;
  requestBody += `--${BOUNDARY}\r\n`;
  requestBody += `Content-Type: ${blob.type}\r\n\r\n`;
  requestBody += `${content}\r\n`;
  requestBody += `--${BOUNDARY}--`;

  // fetch APIを使ってリクエストを送信
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${BOUNDARY}`,
    },
    body: requestBody,
  });

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  console.log(json);

  return json;
};

export const useFiles = (accessToken: string) => {
  const shouldFetch = !!accessToken;
  const key = shouldFetch ? ['gdrive-list-files', accessToken] : null;
  const { data, ...rest } = useSWR(key, ([_, accessToken]) => listFiles(accessToken));

  return {
    files: data ?? [],
    ...rest,
  };
};

export const useGdrive = () => {
  const { oauth } = useOauth();

  return {
    useFiles: () => useFiles(oauth.accessToken),
    uploadFile: (file: NewFile) => uploadFile(file, oauth.accessToken),
  };
};
