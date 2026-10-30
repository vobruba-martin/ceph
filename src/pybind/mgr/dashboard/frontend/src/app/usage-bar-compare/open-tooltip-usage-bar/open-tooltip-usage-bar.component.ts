// TEMPORARY - do not merge. cd-usage-bar (as in the commit) with the tooltip
// kept open, only for the comparison.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TooltipModule } from 'carbon-components-angular';

import { UsageBarComponent } from '~/app/shared/components/usage-bar/usage-bar.component';
import { DimlessBinaryPipe } from '~/app/shared/pipes/dimless-binary.pipe';
import { DimlessPipe } from '~/app/shared/pipes/dimless.pipe';

@Component({
  selector: 'cd-usage-bar-open-tooltip',
  templateUrl: './open-tooltip-usage-bar.component.html',
  styleUrls: ['../../shared/components/usage-bar/usage-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet, TooltipModule],
  providers: [DimlessPipe, DimlessBinaryPipe]
})
export class OpenTooltipUsageBarComponent extends UsageBarComponent {}
