# cd-usage-bar comparison page

**Not for merging.** This branch adds two test pages on top of the change
which replaces the Carbon meter chart in `cd-usage-bar` with a plain HTML/CSS
bar and a Carbon tooltip, to speed up tables with many usage bars (e.g. the
OSD list).

## Pages

- `#/usage-bar-compare` compares the current Carbon meter chart (a copy of
  `cd-usage-bar` from `upstream/main`, in `legacy-usage-bar/`) with the new
  `cd-usage-bar` side by side: thresholds and statuses, labels, narrow table
  columns (with the next cell, to show what overflows), a card with
  `width="100%"` and both tooltips kept open.
- `#/usage-bar-bench?variant=<variant>` renders an OSD-like table for
  measurements. Variants: `legacy` (Carbon meter chart), `new` (the new
  `cd-usage-bar`) and `bare` (the new bar without a tooltip, as a baseline).
  It is driven from the browser console:

  ```js
  usageBarBench.render(50); // render 50 rows, returns ms (change detection, style, layout)
  usageBarBench.update(1); // new values for all rows, like a table refresh
  usageBarBench.nodes(); // number of DOM elements of the table
  usageBarBench.clear();
  ```

  For the full picture record the call in the DevTools Performance panel.

Both pages are outside the login, so no cluster is needed. With a cluster
behind the dev server proxy, the OSD list (`#/osd`) shows the new bar with
real data.

## Running it

```bash
git fetch https://github.com/vobruba-martin/ceph wip-82358-usage-bar-perf-compare
git switch -c wip-82358-usage-bar-perf-compare FETCH_HEAD
cd src/pybind/mgr/dashboard/frontend
npm ci
npx ng serve            # add --proxy-config proxy.conf.json to use a cluster
```

Then open <http://localhost:4200/#/usage-bar-compare>.

When the dev server is started with `--ssl` and a cluster behind the proxy,
log in at `https://localhost:4200`. If the login loops back to the login page,
clear the site data of `localhost`: an old `token` cookie of another
dashboard on `localhost` takes precedence.
