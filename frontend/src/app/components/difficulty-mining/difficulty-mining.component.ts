import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StateService } from '../../services/state.service';

interface EpochProgress {
  base: string;
  change: number;
  progress: number;
  remainingBlocks: number;
  newDifficultyHeight: number;
  colorAdjustments: string;
  colorPreviousAdjustments: string;
  estimatedRetargetDate: number;
  previousRetarget: number;
  blocksUntilHalving: number;
  timeUntilHalving: number;
}

@Component({
  selector: 'app-difficulty-mining',
  templateUrl: './difficulty-mining.component.html',
  styleUrls: ['./difficulty-mining.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifficultyMiningComponent implements OnInit {
  isLoadingWebSocket$: Observable<boolean>;
  difficultyEpoch$: Observable<EpochProgress>;

  blocksUntilHalving: number;
  timeUntilHalving: number;
  currentReward: number;

  @Input() showProgress = true;
  @Input() showHalving = false;
  @Input() showTitle = true;

  constructor(
    public stateService: StateService,
  ) { }

  ngOnInit(): void {
    this.isLoadingWebSocket$ = this.stateService.isLoadingWebSocket$;
    this.difficultyEpoch$ = combineLatest([
      this.stateService.blocks$.pipe(map(([block]) => block)),
      this.stateService.difficultyAdjustment$,
    ])
    .pipe(
      map(([block, da]) => {
        let colorAdjustments = '#ffffff66';
        if (da.difficultyChange > 0) {
          colorAdjustments = '#3bcc49';
        }
        if (da.difficultyChange < 0) {
          colorAdjustments = '#dc3545';
        }

        let colorPreviousAdjustments = '#dc3545';
        if (da.previousRetarget) {
          if (da.previousRetarget >= 0) {
            colorPreviousAdjustments = '#3bcc49';
          }
          if (da.previousRetarget === 0) {
            colorPreviousAdjustments = '#ffffff66';
          }
        } else {
          colorPreviousAdjustments = '#ffffff66';
        }

        const blockHeight = block.height;
        const initialReward = 5; // B1T
        const firstHalvingBlock = 100000;
        const secondHalvingBlock = 200000;
        const subsequentHalvingInterval = 78000;
        const averageBlockTimeMs = 1 * 60 * 1000; // 1 minute in ms

        let blocksUntilNextHalving: number;
        let currentReward: number;

        if (blockHeight < firstHalvingBlock) {
          blocksUntilNextHalving = firstHalvingBlock - blockHeight;
          currentReward = initialReward;
        } else if (blockHeight < secondHalvingBlock) {
          blocksUntilNextHalving = secondHalvingBlock - blockHeight;
          currentReward = initialReward / 2;
        } else {
          const blocksAfterSecondHalving = blockHeight - secondHalvingBlock;
          const halvingsAfterSecond = Math.floor(blocksAfterSecondHalving / subsequentHalvingInterval);
          const nextHalvingBlockAbsolute = secondHalvingBlock + (halvingsAfterSecond + 1) * subsequentHalvingInterval;
          blocksUntilNextHalving = nextHalvingBlockAbsolute - blockHeight;
          currentReward = (initialReward / 4) / Math.pow(2, halvingsAfterSecond);
        }

        this.blocksUntilHalving = blocksUntilNextHalving;
        const calculatedTimeUntilHalving = new Date().getTime() + (blocksUntilNextHalving * averageBlockTimeMs);
        this.timeUntilHalving = calculatedTimeUntilHalving;
        this.currentReward = currentReward; // Store current reward if needed by the template

        const data = {
          base: `${da.progressPercent.toFixed(2)}%`,
          change: da.difficultyChange,
          progress: da.progressPercent,
          remainingBlocks: da.remainingBlocks - 1,
          colorAdjustments,
          colorPreviousAdjustments,
          newDifficultyHeight: da.nextRetargetHeight,
          estimatedRetargetDate: da.estimatedRetargetDate,
          previousRetarget: da.previousRetarget,
          blocksUntilHalving: blocksUntilNextHalving,
          timeUntilHalving: calculatedTimeUntilHalving,
        };
        return data;
      })
    );
  }

  isEllipsisActive(e): boolean {
    return (e.offsetWidth < e.scrollWidth);
  }
}
