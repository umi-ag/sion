export type File = {
  id: string;
  name: string;
  size: number;
  modified: string;
  created: string;
  type: string;
};

export type NewFile = {
  name: string;
  mimeType: string;
  content: string;
};
