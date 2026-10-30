// TEMPORARY - do not merge. The current cd-usage-bar (Carbon meter chart)
// with its tooltip kept open, only for the comparison.
import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnDestroy } from '@angular/core';
import { ChartsModule } from '@carbon/charts-angular';

import { CssHelper } from '~/app/shared/classes/css-helper';
import { DimlessBinaryPipe } from '~/app/shared/pipes/dimless-binary.pipe';
import { DimlessPipe } from '~/app/shared/pipes/dimless.pipe';
import { LegacyUsageBarComponent } from '../legacy-usage-bar/legacy-usage-bar.component';

@Component({
  selector: 'cd-legacy-usage-bar-open-tooltip',
  templateUrl: '../legacy-usage-bar/legacy-usage-bar.component.html',
  styleUrls: ['../legacy-usage-bar/legacy-usage-bar.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet, ChartsModule],
  providers: [CssHelper, DimlessPipe, DimlessBinaryPipe]
})
export class LegacyOpenTooltipUsageBarComponent
  extends LegacyUsageBarComponent
  implements AfterViewInit, OnDestroy
{
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private timer: ReturnType<typeof setInterval>;

  // The meter chart shows its tooltip on 'mouseover' of the bar; fake one in
  // the middle of the bar as soon as the chart is rendered.
  ngAfterViewInit() {
    let tries = 0;
    this.timer = setInterval(() => {
      const bar = this.host.nativeElement.querySelector('rect.value');
      const box = bar?.getBoundingClientRect();
      if (box?.width > 0 || ++tries > 50) {
        clearInterval(this.timer);
        bar?.dispatchEvent(
          new MouseEvent('mouseover', {
            bubbles: true,
            clientX: box.left + box.width / 2,
            clientY: box.top + box.height / 2
          })
        );
      }
    }, 200);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
