'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useZkLoginSetup } from 'src/store/zklogin';

type File = {
  id: string;
  name: string;
  size: number;
  modified: string;
  created: string;
  type: string;
};

const API_KEY = 'AIzaSyDII8ecl6Kzef3ccXh9XYt-kHIWWcFtbqk';

const Page = () => {
  const zkLoginStore = useZkLoginSetup();
  const [files, setFiles] = useState<File[]>([]);

  const list = async () => {
    const url = `https://www.googleapis.com/drive/v3/files?key=${API_KEY}`;
    const accessToken = zkLoginStore.accessToken;
    console.log('accessToken', accessToken);

    console.log('url', url);
    const r = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });

    if (!r.ok) {
      console.error(await r.json());
      return;
    }

    const json = await r.json();
    console.log(json);
    setFiles(json.files);
  }

  useEffect(() => {
    if (!zkLoginStore.jwt || !zkLoginStore.accessToken) {
      redirect('/login');
    }
  }, [zkLoginStore]);

  return (
    <div>
      <h1>gdrive</h1>
      <p>
        <Link href="/login" className='text-blue-400 underline'>Login</Link>
      </p>

      <div>
        <button className="border border-black px-4 py-1 rounded" onClick={list}>List</button>
      </div>
      <ul>
        {files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Page;
