

# Plan: Dashboard Chart, Login History, and UI Polish

## 1. Visitor Activity Chart (new component)

Create `src/components/security/VisitorChart.tsx` using recharts (already available via `chart.tsx`):
- Query visitors from the past 7 days, group by date
- Render a `BarChart` with bars for verified (green) and unverified (orange) visitors per day
- Use `ChartContainer` and `ChartTooltip` from the existing chart components
- Add to Dashboard between `StatsGrid` and `CameraPreview`

## 2. Login History Table

**Database migration** -- create a `login_history` table:
```sql
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  name text,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  device_info text
);
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own login history" ON public.login_history FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Auth page update** -- after successful login in `Auth.tsx`, insert a row into `login_history` with email, name, and `navigator.userAgent` as device info.

**Settings page** -- add a "Login History" section showing the last 10 logins in a table (date/time, email, device).

## 3. Demo with Human Face Images

Update `useEvents.tsx` `createDemoEvent` to use realistic human face placeholder URLs from `randomuser.me` API (`https://randomuser.me/api/portraits/...`) instead of `picsum.photos` random images.

## 4. UI Polish for Production Feel

- **Dashboard**: Add a greeting section ("Good morning, {name}") with date/time below the header. Improve card spacing, add subtle gradient backgrounds, and smooth transitions.
- **StatsGrid**: Add animated count-up effect and subtle hover transforms on stat cards.
- **RecentActivity**: Use avatar-style circular thumbnails for visitor snapshots. Add status dot indicators.
- **StatusCard**: Add a pulsing shield animation and a gradient border effect.
- **BottomNav**: Add a slight backdrop blur enhancement and active indicator dot.

## 5. How to Download & Push to GitHub

After implementation, I will provide instructions on:
- Connecting the Lovable project to GitHub via Settings > GitHub
- Cloning the repo locally
- Running the project with `npm install && npm run dev`

## Technical Notes

- recharts is already a dependency (used by `chart.tsx`)
- The `login_history` table needs a migration (will use the migration tool)
- No new dependencies required
- All changes are React + TypeScript + Tailwind, keeping the existing stack

