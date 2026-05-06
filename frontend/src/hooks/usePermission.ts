import { useAuthStore } from '@/stores/authStore'

export const usePermission = () => {
  const user = useAuthStore((s) => s.user)
  return {
    isStaff: !!user?.is_staff,
    isSuperUser: !!user?.is_superuser,
    canDelete: !user?.is_staff || !!user?.is_superuser,
  }
}
