import { AdminService } from './admin-service';
import { DemoAdminService } from './demo-admin-service';
import { SupabaseAdminService } from './supabase-admin-service';

let adminServiceInstance: AdminService | null = null;

export function getAdminService(): AdminService {
  if (!adminServiceInstance) {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasRealSupabase = Boolean(
      supabaseUrl &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseUrl.includes('your-project-ref') &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );

    if (!isDemoMode && hasRealSupabase) {
      adminServiceInstance = new SupabaseAdminService();
    } else {
      adminServiceInstance = new DemoAdminService();
    }
  }
  return adminServiceInstance as AdminService;
}

export function resetAdminServiceInstance(): void {
  adminServiceInstance = null;
}
