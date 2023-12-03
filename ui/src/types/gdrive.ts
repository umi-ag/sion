export type File = {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
};

export type NewFile = {
  name: string;
  mimeType: string;
  content: string;
  parents: string[];
};
