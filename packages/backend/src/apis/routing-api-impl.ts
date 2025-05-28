/**
 * @author axel7083
 */
import { RoutingApi } from '/@shared/src/apis/routing-api';
import type { RoutingService } from '../services/routing-service';
import type { Tab } from '/@shared/src/models/Tab';
import type { TabsService } from '../services/tabs-service';

interface Dependencies {
  routing: RoutingService;
  tabs: TabsService;
}

export class RoutingApiImpl extends RoutingApi {
  constructor(protected dependencies: Dependencies) {
    super();
  }

  override async readRoute(): Promise<string | undefined> {
    return this.dependencies.routing.read();
  }

  override async getTabs(): Promise<Array<Tab>> {
    return this.dependencies.tabs.all();
  }

  override async closeTab(tabId: string): Promise<void> {
    this.dependencies.tabs.unregister(tabId);

    // TODO: cleanup logger if one is attached
  }

  override async registerTab(tab: Tab): Promise<void> {
    this.dependencies.tabs.register(tab);
  }
}
