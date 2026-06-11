export function isAdminAuthEnabled() {
  return process.env.NODE_ENV === "production"
}

export function validateAdminCredentials(header: string | null) {
  if (!isAdminAuthEnabled()) {
    return true
  }

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password || !header?.startsWith("Basic ")) {
    return false
  }

  const encoded = header.slice("Basic ".length)
  const decoded = atob(encoded)
  const separator = decoded.indexOf(":")

  if (separator < 0) {
    return false
  }

  return (
    decoded.slice(0, separator) === username &&
    decoded.slice(separator + 1) === password
  )
}
