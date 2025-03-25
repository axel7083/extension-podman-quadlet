import type { Project } from '/@shared/src/models/project';
import type { Template } from '/@shared/src/models/template';
import templates from '../assets/templates.json';
import { randomUUID } from 'node:crypto';
import type { Disposable } from '@podman-desktop/api';

export class ProjectService implements Disposable {
  #projects: Map<string, Project> = new Map<string, Project>();

  dispose(): void {
    this.#projects.clear();
  }

  public all(): Array<Project> {
    return Array.from(this.#projects.values());
  }

  public templates(): Array<Template> {
    return templates;
  }

  protected getTemplate(templateId: string): Template {
    const template = this.templates().find(template => template.id === templateId);
    if (!template) throw new Error(`no template found with id ${templateId}`);
    return template;
  }

  protected generateUUID(): string {
    return randomUUID();
  }

  public create(options?: { templateId?: string }): Project {
    let project: Project;
    if (options?.templateId) {
      const template = this.getTemplate(options.templateId);
      project = {
        name: `${template.name} - copy`,
        id: this.generateUUID(),
        files: template.files,
      };
    } else {
      project = {
        name: 'New Project',
        id: this.generateUUID(),
        files: [{
          name: 'example.container',
          content: '',
          language: 'ini',
        }],
      };
    }

    this.#projects.set(project.id, project);
    return project;
  }

  public read(projectId: string): Project {
    const project = this.#projects.get(projectId);
    if (!project) throw new Error(`no project found with id ${projectId}`);
    return project;
  }

  public update(project: Project): Project {
    // ensure the project exists
    this.read(project.id);

    this.#projects.set(project.id, project);
    return project;
  }

  public delete(projectId: string): void {
    if(!this.#projects.has(projectId)) throw new Error(`no project found with id ${projectId}`);
    this.#projects.delete(projectId);
  }
}
