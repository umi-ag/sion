'use client';

import toast from 'react-hot-toast';
import { NewFile } from 'src/types';
import { listFiles, toGdriveUrl, uploadFile } from 'src/utils/gdrive';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useOauth } from './oauth';

export const useFiles = (accessToken: string) => {
  const shouldFetch = !!accessToken;
  const key = shouldFetch ? ['gdrive-list-files', accessToken] : null;
  const { data, ...rest } = useSWR(key, ([_, accessToken]) => listFiles(accessToken), {
    revalidateOnFocus: false,
  });

  return {
    files: data ?? [],
    ...rest,
  };
};

export const useUploadFileMutation = (accessToken: string) => {
  const { data, trigger, ...rest } = useSWRMutation(
    'gdrive-upload-file',
    (_, { arg }: { arg: NewFile }) => uploadFile(arg, accessToken),
    {
      onSuccess: (result) => {
        const message = (
          <span>
            アップロード完了！{' '}
            <a
              href={toGdriveUrl(result.id)}
              className="text-blue-400 underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              {result.name}
            </a>
          </span>
        );
        toast.success(message);
      },
      onError: (err) => {
        console.error(err);
        toast.error(err.message);
      },
    },
  );

  return {
    ...rest,
    uploadFileResult: data,
    uploadFile: trigger,
  };
};

export const useGdrive = () => {
  const { oauth } = useOauth();

  return {
    filesQuery: useFiles(oauth.accessToken),
    uploadFileMutation: useUploadFileMutation(oauth.accessToken),
    uploadFile: (file: NewFile) => uploadFile(file, oauth.accessToken),
  };
};
