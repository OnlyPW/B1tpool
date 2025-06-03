import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { StateService } from '../../../services/state.service';
import { Observable } from 'rxjs';
import { IBackendInfo } from '../../../interfaces/websocket.interface';

@Component({
  selector: 'app-global-footer',
  templateUrl: './global-footer.component.html',
  styleUrls: ['./global-footer.component.scss']
})
export class GlobalFooterComponent implements OnInit {
  backendInfo$: Observable<IBackendInfo>;
  frontendVersion: string;
  frontendGitCommitHash: string;
  officialMempoolSpace: boolean;
  env: any;

  constructor(
    public stateService: StateService,
    @Inject(LOCALE_ID) public locale: string
  ) { }

  ngOnInit(): void {
    this.backendInfo$ = this.stateService.backendInfo$;
    this.frontendVersion = this.stateService.env.PACKAGE_JSON_VERSION;
    this.frontendGitCommitHash = this.stateService.env.GIT_COMMIT_HASH;
    this.officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
    this.env = this.stateService.env;
    }
}
