'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useGdrive } from 'src/store';
import { toGdriveUrl } from 'src/utils/gdrive';

const Page = () => {
  const { filesQuery, uploadFileMutation, createFolderMutation } = useGdrive();
  const [file, setFile] = useState({
    name: '',
    mimeType: 'text/plain',
    content: '',
    parents: [] as string[],
  });
  const [folderName, setFolderName] = useState('');

  const folders = useMemo(
    () => filesQuery.files.filter((file) => file.mimeType === 'application/vnd.google-apps.folder'),
    [filesQuery.files],
  );

  return (
    <div className="h-full overflow-y-scroll">
      <h1>gdrive</h1>
      <p className="mb-8">
        <Link href="/login" className="text-blue-400 underline">
          Login
        </Link>
      </p>

      <div className="mb-8">
        <select
          className="select select-bordered select-sm w-full max-w-xs mb-4"
          onChange={(e) => setFile({ ...file, parents: [e.currentTarget.value] })}
        >
          <option disabled selected>
            Parent folder
          </option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>

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

        <button
          className="btn btn-accent"
          onClick={() => uploadFileMutation.uploadFile(file as never)}
          disabled={uploadFileMutation.isMutating}
        >
          {uploadFileMutation.isMutating && <span className="loading loading-spinner" />}
          Upload
        </button>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="folder name"
          className="input input-bordered input-primary input-sm w-full max-w-xs mb-4"
          onInput={(e) => setFolderName(e.currentTarget.value)}
        />

        <button
          className="btn btn-accent"
          onClick={async () => {
            await createFolderMutation.createFolder(folderName);
            filesQuery.mutate();
          }}
          disabled={createFolderMutation.isMutating}
        >
          {createFolderMutation.isMutating && <span className="loading loading-spinner" />}
          Create Folder
        </button>
      </div>

      <details>
        <summary>{filesQuery.isLoading ? <span>Loading...</span> : <span>Files</span>}</summary>

        <ul>
          {filesQuery.files.map((file) => (
            <li key={file.id}>
              <a
                href={toGdriveUrl(file.id)}
                className="text-blue-400 underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default Page;
