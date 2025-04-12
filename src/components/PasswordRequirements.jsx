export function PasswordRequirements() {
  return (
    <div className="mt-2 space-y-1">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Your password must meet these requirements:
      </p>
      <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
        <li>At least 8 characters long</li>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>At least one special character (!@#$%^&*)</li>
      </ul>
    </div>
  )
}