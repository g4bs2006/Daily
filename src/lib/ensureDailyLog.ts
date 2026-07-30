import { supabase } from './supabase'

/**
 * Pillar tables have a FK to daily_log(log_date). Must be awaited before
 * any pillar upsert for that date, so the row exists when the FK check runs.
 */
export async function ensureDailyLog(logDate: string) {
  return supabase.from('daily_log').upsert({ log_date: logDate }, { onConflict: 'log_date' })
}
