export interface Project {
  name: string;
  id: string;
  files: Array<{
    language: string;
    content: string;
    name: string;
  }>
}
