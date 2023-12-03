'use client';

import { NewFile } from 'src/types';
import { createFolder, listFiles, uploadFile } from 'src/utils/gdrive';
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
      // onSuccess: (result) => {
      //   const message = (
      //     <span>
      //       アップロード完了！:{' '}
      //       <a
      //         href={toGdriveUrl(result.id)}
      //         className="text-blue-400 underline"
      //         target="_blank"
      //         rel="noreferrer noopener"
      //       >
      //         {result.name}
      //       </a>
      //     </span>
      //   );
      //   toast.success(message);
      // },
      // onError: (err) => {
      //   console.error(err);
      //   toast.error(err.message);
      // },
    },
  );

  return {
    ...rest,
    uploadFileResult: data,
    uploadFile: trigger,
  };
};

export const useCreateFolderMutation = (accessToken: string) => {
  const { data, trigger, ...rest } = useSWRMutation(
    'gdrive-create-folder',
    (_, { arg }: { arg: string }) => createFolder(arg, accessToken),
    {
      // onSuccess: (result) => {
      //   const message = (
      //     <span>
      //       フォルダ作成完了！:{' '}
      //       <a
      //         href={toGdriveUrl(result.id)}
      //         className="text-blue-400 underline"
      //         target="_blank"
      //         rel="noreferrer noopener"
      //       >
      //         {result.name}
      //       </a>
      //     </span>
      //   );
      //   toast.success(message);
      // },
      // onError: (err) => {
      //   console.error(err);
      //   toast.error(err.message);
      // },
    },
  );

  return {
    ...rest,
    createFolderResult: data,
    createFolder: trigger,
  };
};

export const useGdrive = () => {
  const { oauth } = useOauth();

  return {
    filesQuery: useFiles(oauth.accessToken),
    uploadFileMutation: useUploadFileMutation(oauth.accessToken),
    createFolderMutation: useCreateFolderMutation(oauth.accessToken),
  };
};
