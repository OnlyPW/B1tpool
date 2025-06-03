import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  officialMempoolSpace: boolean;
  env: any;

  constructor(
    private seoService: SeoService,
    public stateService: StateService
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle($localize`:@@privacy-policy.title:Privacy Policy`);
    this.officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
    this.env = this.stateService.env;
  }
}
