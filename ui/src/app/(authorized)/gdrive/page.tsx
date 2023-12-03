'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGdrive } from 'src/store';

const Page = () => {
  const { filesQuery, uploadFile } = useGdrive();
  const [file, setFile] = useState({
    name: '',
    mimeType: 'text/plain',
    content: '',
  });

  return (
    <div className="h-full overflow-y-scroll">
      <h1>gdrive</h1>
      <p className="mb-8">
        <Link href="/login" className="text-blue-400 underline">
          Login
        </Link>
      </p>

      <div className="mb-8">
        <input
          type="text"
          placeholder="file name"
          className="input input-bordered input-primary input-sm w-full max-w-xs mb-4"
          onInput={(e) => setFile({ ...file, name: e.currentTarget.value })}
        />

        <input
          type="text"
          placeholder="mime type"
          className="input input-bordered input-primary input-sm w-full max-w-xs mb-4"
          value={file.mimeType}
          onInput={(e) => setFile({ ...file, mimeType: e.currentTarget.value })}
        />

        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Bio"
          onInput={(e) => setFile({ ...file, content: e.currentTarget.value })}
        />

        <button className="btn btn-accent" onClick={() => uploadFile(file as never)}>
          Upload
        </button>
      </div>

      <details>
        <summary>{filesQuery.isLoading ? <span>Loading...</span> : <span>Files</span>}</summary>

        <ul>
          {filesQuery.files.map((file) => (
            <li key={file.id}>{file.name}</li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default Page;
