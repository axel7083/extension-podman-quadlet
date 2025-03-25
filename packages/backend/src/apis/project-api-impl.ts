import { ProjectApi } from '/@shared/src/apis/project-api';
import type { ProjectService } from '../services/project-service';
import type { Project } from '/@shared/src/models/project';
import type { Template } from '/@shared/src/models/template';
import { QuadletService } from '../services/quadlet-service';
import type {
  ProviderContainerConnectionIdentifierInfo
} from '/@shared/src/models/provider-container-connection-identifier-info';
import { ProviderService } from '../services/provider-service';

interface Dependencies {
  projects: ProjectService;
  quadlets: QuadletService;
  providers: ProviderService;
}

/**
 * @deprecated use localstorage in the webview instead
 */
export class ProjectApiImpl extends ProjectApi {
  constructor(protected dependencies: Dependencies) {
    super();
  }

  override async all(): Promise<Array<Project>> {
    return this.dependencies.projects.all();
  }

  override async templates(): Promise<Array<Template>> {
    return this.dependencies.projects.templates();
  }
  override async create(options?: { templateId?: string }): Promise<Project> {
    return this.dependencies.projects.create(options);
  }
  override async read(projectId: string): Promise<Project> {
    return this.dependencies.projects.read(projectId);
  }
  override async update(project: Project): Promise<Project> {
    return this.dependencies.projects.update(project);
  }
  override async delete(projectId: string): Promise<void> {
    return this.dependencies.projects.delete(projectId);
  }

  override async loadIntoMachine(options: { projectId: string, provider: ProviderContainerConnectionIdentifierInfo }): Promise<void> {
    // Get the project
    const project = await this.read(options.projectId);

    // Get the connection to use
    const connection = this.dependencies.providers.getProviderContainerConnection(options.provider);

    // Save the resources
    await this.dependencies.quadlets.saveResources({
      provider: connection,
      resources: project.files.map((file) => {
        return {
          filename: file.name,
          content: file.content,
        };
      }),
    });

    // refresh quadlets
    await this.dependencies.quadlets.refreshQuadletsStatuses();
  }
}
