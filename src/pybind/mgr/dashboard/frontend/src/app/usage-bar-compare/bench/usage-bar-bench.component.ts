// TEMPORARY - do not merge. Benchmark of the usage bar variants and their
// tooltips in an OSD-like table. Driven from the console or
// DevTools protocol through `window.usageBarBench`.
import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';

import { ComponentsModule } from '~/app/shared/components/components.module';
import { BareUsageBarComponent } from '../bare-usage-bar/bare-usage-bar.component';
import { LegacyUsageBarComponent } from '../legacy-usage-bar/legacy-usage-bar.component';

const TiB = 1024 ** 4;

export type BenchVariant = 'legacy' | 'bare' | 'new';

interface Item {
  id: number;
  total: number;
  used: number;
}

@Component({
  selector: 'cd-usage-bar-bench',
  standalone: true,
  imports: [ComponentsModule, BareUsageBarComponent, LegacyUsageBarComponent],
  template: `
    <div class="content-theme bench">
      <p class="cds--type-label-01">variant: {{ variant }}, rows: {{ items.length }}</p>
      <div class="cds--data-table-content">
        <table class="cds--data-table cds--data-table--sm">
          <tbody>
            @for (item of items; track item.id) {
              <tr>
                <td>{{ item.id }}</td>
                <td>
                  @switch (variant) {
                    @case ('legacy') {
                      <cd-legacy-usage-bar
                        [title]="'osd ' + item.id"
                        [total]="item.total"
                        [used]="item.used"
                        [warningThreshold]="0.85"
                        [errorThreshold]="0.95"
                      ></cd-legacy-usage-bar>
                    }
                    @case ('bare') {
                      <cd-usage-bar-bare
                        [title]="'osd ' + item.id"
                        [total]="item.total"
                        [used]="item.used"
                        [warningThreshold]="0.85"
                        [errorThreshold]="0.95"
                      ></cd-usage-bar-bare>
                    }
                    @default {
                      <cd-usage-bar
                        [title]="'osd ' + item.id"
                        [total]="item.total"
                        [used]="item.used"
                        [warningThreshold]="0.85"
                        [errorThreshold]="0.95"
                      ></cd-usage-bar>
                    }
                  }
                </td>
                <td>1.2 k/s</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: ['.bench { padding: 1rem; }']
})
export class UsageBarBenchComponent implements OnDestroy {
  variant: BenchVariant =
    (new URLSearchParams(window.location.hash.split('?')[1] || '').get(
      'variant'
    ) as BenchVariant) || 'new';
  items: Item[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    (window as any).usageBarBench = {
      // Render n rows; returns the synchronous time (change detection plus
      // style and layout), in ms.
      render: (n: number) => this.measure(() => (this.items = this.makeItems(n, 0))),
      // Like a table refresh: new objects with new values for all rows.
      update: (seed: number) =>
        this.measure(() => (this.items = this.makeItems(this.items.length, seed))),
      clear: () => this.measure(() => (this.items = [])),
      nodes: () => document.querySelectorAll('.bench *').length
    };
  }

  ngOnDestroy() {
    delete (window as any).usageBarBench;
  }

  private makeItems(n: number, seed: number): Item[] {
    return Array.from({ length: n }, (_, id) => ({
      id,
      total: TiB,
      // 0–99 %, so that some rows reach the warning and danger thresholds.
      used: TiB * (((id * 37 + seed * 11) % 100) / 100)
    }));
  }

  private measure(change: () => void): number {
    return this.ngZone.run(() => {
      const t0 = performance.now();
      change();
      this.cdRef.detectChanges();
      // Force style and layout, which the browser would do before painting.
      void document.body.offsetHeight;
      return performance.now() - t0;
    });
  }
}
