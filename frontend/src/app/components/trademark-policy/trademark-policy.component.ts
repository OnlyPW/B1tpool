import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-trademark-policy',
  templateUrl: './trademark-policy.component.html',
  styleUrls: ['./trademark-policy.component.scss']
})
export class TrademarkPolicyComponent implements OnInit {
  officialMempoolSpace: boolean;
  env: any;

  constructor(
    private seoService: SeoService,
    public stateService: StateService
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle($localize`:@@trademark-policy.title:Trademark Policy`);
    this.officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
    this.env = this.stateService.env;
  }
}
