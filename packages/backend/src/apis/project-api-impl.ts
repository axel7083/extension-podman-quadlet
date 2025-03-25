import { ProjectApi } from '/@shared/src/apis/project-api';
import type { ProjectService } from '../services/project-service';
import type { Project } from '/@shared/src/models/project';
import type { Template } from '/@shared/src/models/template';

interface Dependencies {
  projects: ProjectService;
}

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
}
