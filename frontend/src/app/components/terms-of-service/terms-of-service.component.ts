import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {
  officialMempoolSpace: boolean;
  env: any;

  constructor(
    private seoService: SeoService,
    public stateService: StateService
  ) { }

  ngOnInit(): void {
    this.seoService.setTitle($localize`:@@terms-of-service.title:Terms of Service`);
    this.officialMempoolSpace = this.stateService.env.OFFICIAL_MEMPOOL_SPACE;
    this.env = this.stateService.env;
  }
}
