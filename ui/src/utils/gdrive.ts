import { File, NewFile } from 'src/types';

const API_KEY = 'AIzaSyDII8ecl6Kzef3ccXh9XYt-kHIWWcFtbqk';

export const listFiles = async (accessToken: string) => {
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

// バウンダリ文字列を定義
const BOUNDARY = '-------314159265358979323846';

export const uploadFile = async (
  { name, mimeType, content, parents }: NewFile,
  accessToken: string,
) => {
  // メタデータを定義
  const metadata = {
    name, // ファイル名
    mimeType, // MIMEタイプ
    parents, // 親フォルダのID
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
    throw new Error(await r.text());
  }

  const json = await r.json();
  console.log(json);

  return json as File;
};

export const toGdriveUrl = (fileId: string) => `https://drive.google.com/file/d/${fileId}/view`;

export const createFolder = async (name: string, accessToken: string) => {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const r = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!r.ok) {
    throw new Error(await r.text());
  }

  const json = await r.json();
  console.log(json);

  return json as File;
};
