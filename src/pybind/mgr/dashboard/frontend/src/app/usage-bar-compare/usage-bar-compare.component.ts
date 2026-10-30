// TEMPORARY - do not merge. Side-by-side comparison of the Carbon meter
// and the lightweight variant of cd-usage-bar.
import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, ElementRef } from '@angular/core';

import { ComponentsModule } from '~/app/shared/components/components.module';
import { LegacyOpenTooltipUsageBarComponent } from './legacy-open-tooltip-usage-bar/legacy-open-tooltip-usage-bar.component';
import { LegacyUsageBarComponent } from './legacy-usage-bar/legacy-usage-bar.component';
import { OpenTooltipUsageBarComponent } from './open-tooltip-usage-bar/open-tooltip-usage-bar.component';

const TiB = 1024 ** 4;

interface Case {
  label: string;
  total: number;
  used: number;
  warningThreshold?: number;
  errorThreshold?: number;
  enablePercentageLabel?: boolean;
  isBinary?: boolean;
  decimals?: number;
  width?: string;
  customLabel?: string;
  containerWidth?: string;
  // Text of the next table cell, rendered right after the container.
  neighbor?: string;
}

interface Section {
  title: string;
  // 'open-tooltips': the tooltips of both variants, kept open.
  kind?: 'open-tooltips';
  cases: Case[];
}

const osd = (label: string, ratio: number): Case => ({
  label,
  total: TiB,
  used: TiB * ratio,
  warningThreshold: 0.85,
  errorThreshold: 0.95
});

@Component({
  selector: 'cd-usage-bar-compare',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ComponentsModule,
    LegacyUsageBarComponent,
    OpenTooltipUsageBarComponent,
    LegacyOpenTooltipUsageBarComponent
  ],
  templateUrl: './usage-bar-compare.component.html',
  styleUrls: ['./usage-bar-compare.component.scss']
})
export class UsageBarCompareComponent implements AfterViewInit {
  metrics = '';
  // Tooltip of the lightweight bar.

  constructor(private elementRef: ElementRef) {}

  // Dump layout measurements so the comparison can be checked from a
  // headless browser (--dump-dom).
  ngAfterViewInit() {
    setTimeout(() => {
      const root: HTMLElement = this.elementRef.nativeElement;
      const rows = Array.from(root.querySelectorAll('table.cds--data-table > tbody > tr'));
      const out = rows.map((tr) => {
        const tds = Array.from(tr.querySelectorAll(':scope > td'));
        const measure = (td: Element) => {
          const bar = td.querySelector(
            'cd-usage-bar, cd-usage-bar-open-tooltip, cd-legacy-usage-bar, cd-legacy-usage-bar-open-tooltip'
          ) as HTMLElement;
          const r = bar.getBoundingClientRect();
          const cell = td.getBoundingClientRect();
          const fill =
            (bar.querySelector('rect.value') as SVGElement) ||
            (bar.querySelector('.usage-bar__fill') as HTMLElement);
          const track =
            (bar.querySelector('rect.container') as SVGElement) ||
            (bar.querySelector('.usage-bar__track') as HTMLElement);
          const labels = Array.from(
            bar.querySelectorAll(
              'text, .usage-bar__labels span, cd-usage-bar > span, cd-usage-bar-open-tooltip > span, cd-legacy-usage-bar > span'
            )
          )
            .map((e) => {
              const b = e.getBoundingClientRect();
              return `${(e.textContent || '').trim()}@${Math.round(b.left - r.left)},${Math.round(
                b.top - r.top
              )} w${Math.round(b.width)} ${
                e instanceof SVGElement ? getComputedStyle(e).fill : getComputedStyle(e).color
              }`;
            })
            .filter((t) => !t.startsWith('@'));
          const statusEl = bar.querySelector('g.status-indicator, svg.usage-bar__status');
          const status = statusEl
            ? `${(statusEl.getAttribute('class') || '').replace(/.*status--/, '')} ${Math.round(
                statusEl.getBoundingClientRect().left - r.left
              )},${Math.round(statusEl.getBoundingClientRect().top - r.top)} ${
                getComputedStyle(statusEl.querySelector('circle')).fill
              }`
            : '-';
          return {
            bar: `${Math.round(r.width)}x${Math.round(r.height)}`,
            cell: `${Math.round(cell.width)}x${Math.round(cell.height)}`,
            overflow: Math.round(r.right - cell.right),
            hostTop: Math.round(r.top - cell.top),
            columns: Array.from(td.querySelectorAll('.compare__columns td'))
              .map((x) => {
                const b = x.getBoundingClientRect();
                return `${Math.round(b.width)}x${Math.round(b.height)}@${Math.round(b.top)}`;
              })
              .join(' | '),
            fillTop: fill ? Math.round(fill.getBoundingClientRect().top - r.top) : null,
            display: getComputedStyle(bar).display,
            fill: fill
              ? `${Math.round(fill.getBoundingClientRect().width)}x${Math.round(
                  fill.getBoundingClientRect().height
                )} ${getComputedStyle(fill)[fill instanceof SVGElement ? 'fill' : 'backgroundColor']}`
              : '-',
            track: track
              ? `${Math.round(track.getBoundingClientRect().width)}x${Math.round(
                  track.getBoundingClientRect().height
                )} ${getComputedStyle(track)[track instanceof SVGElement ? 'fill' : 'backgroundColor']}`
              : '-',
            labels,
            statusIconChars: status
          };
        };
        return {
          case: tr.getAttribute('data-case'),
          meter: measure(tds[1]),
          lite: measure(tds[2])
        };
      });
      this.metrics = JSON.stringify(out);
    }, 3000);
  }

  sections: Section[] = [
    {
      title: 'OSD list (thresholds 85 % / 95 %)',
      cases: [
        osd('0 %', 0),
        osd('0.0001 %', 0.000001),
        osd('42 %', 0.42),
        osd('86 % (warning)', 0.86),
        osd('96 % (danger)', 0.96),
        osd('100 %', 1),
        osd('110 % (used > total)', 1.1)
      ]
    },
    {
      title: 'Labels',
      cases: [
        {
          label: 'no percentage, binary',
          total: 10242424,
          used: 5122424,
          enablePercentageLabel: false
        },
        {
          label: 'isBinary=false (RGW objects)',
          total: 10000,
          used: 4200,
          isBinary: false
        },
        {
          label: 'no percentage, isBinary=false',
          total: 10000,
          used: 4200,
          isBinary: false,
          enablePercentageLabel: false
        },
        { label: 'customLabel', total: 100, used: 30, customLabel: 'Capacity' },
        { label: 'no data (total = 0)', total: 0, used: 0 }
      ]
    },
    {
      title: 'Narrow columns (dashed: column border, next cell: Read ops)',
      cases: [
        { ...osd('column 15rem', 0.42), containerWidth: '15rem', neighbor: '1.2 k/s' },
        { ...osd('column 10rem', 0.42), containerWidth: '10rem', neighbor: '1.2 k/s' },
        { ...osd('column 6rem', 0.96), containerWidth: '6rem', neighbor: '1.2 k/s' },
        {
          label: 'column 10rem, no percentage',
          total: TiB,
          used: TiB * 0.42,
          enablePercentageLabel: false,
          containerWidth: '10rem',
          neighbor: '1.2 k/s'
        }
      ]
    },
    {
      title: 'Card (width 100 %, like the pool capacity card)',
      cases: [
        {
          label: 'container 16rem',
          total: TiB,
          used: TiB * 0.63,
          width: '100%',
          containerWidth: '16rem'
        },
        {
          label: 'container 20rem',
          total: TiB,
          used: TiB * 0.63,
          width: '100%',
          containerWidth: '20rem'
        }
      ]
    },
    {
      title: 'Tooltips (kept open; 96 % used, danger, bar width 10rem)',
      kind: 'open-tooltips',
      cases: [{ ...osd('96 % (danger), width 10rem', 0.96), width: '10rem' }]
    }
  ];

  // Two columns: OSD list and narrow columns left, the rest right.
  columns: Section[][] = [
    [this.sections[0], this.sections[2]],
    [this.sections[1], this.sections[3], this.sections[4]]
  ];
}
