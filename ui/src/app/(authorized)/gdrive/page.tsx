'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGdrive } from 'src/store';

const Page = () => {
  const { useFiles, uploadFile, uploadFile2 } = useGdrive();
  const { files, isLoading } = useFiles();
  const [file, setFile] = useState({
    name: '',
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

        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Bio"
          onInput={(e) => setFile({ ...file, content: e.currentTarget.value })}
        />

        <button className="btn btn-accent" onClick={() => uploadFile(file as never)}>
          Upload
        </button>

        <button className="btn btn-accent" onClick={() => uploadFile2()}>
          Upload2
        </button>
      </div>

      <details>
        <summary>{isLoading ? <span>Loading...</span> : <span>Files</span>}</summary>

        <ul>
          {files.map((file) => (
            <li key={file.id}>{file.name}</li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default Page;
