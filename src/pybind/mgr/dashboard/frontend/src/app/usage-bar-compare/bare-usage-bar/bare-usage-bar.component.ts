// TEMPORARY - do not merge. cd-usage-bar without any tooltip, as the
// baseline of the tooltip benchmark.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { UsageBarComponent } from '~/app/shared/components/usage-bar/usage-bar.component';
import { DimlessBinaryPipe } from '~/app/shared/pipes/dimless-binary.pipe';
import { DimlessPipe } from '~/app/shared/pipes/dimless.pipe';

@Component({
  selector: 'cd-usage-bar-bare',
  templateUrl: './bare-usage-bar.component.html',
  styleUrls: ['../../shared/components/usage-bar/usage-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet],
  providers: [DimlessPipe, DimlessBinaryPipe]
})
export class BareUsageBarComponent extends UsageBarComponent {}
