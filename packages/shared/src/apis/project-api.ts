import type { Project } from '../models/project';
import type { Template } from '../models/template';
import type {
  ProviderContainerConnectionIdentifierInfo
} from '../models/provider-container-connection-identifier-info';

/**
 * @deprecated use localstorage in the webview instead
 */
export abstract class ProjectApi {
  static readonly CHANNEL: string = 'project-api';

  abstract all(): Promise<Array<Project>>;
  abstract templates(): Promise<Array<Template>>;

  // CRUD operation
  abstract create(options?: {
    templateId?: string;
  }): Promise<Project>;
  abstract read(projectId: string): Promise<Project>;
  abstract update(project: Project): Promise<Project>;
  abstract delete(projectId: string): Promise<void>;

  abstract loadIntoMachine(options: {
    projectId: string,
    provider: ProviderContainerConnectionIdentifierInfo,
  }): Promise<void>;
}
