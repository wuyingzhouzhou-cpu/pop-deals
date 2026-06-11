export type CollectorLicenseDecision = {
  allowed: boolean
  license: string
  licenseUrl: string
  reason: string
}

const allowedLicenses = [
  { key: "cc0", label: "CC0 / Public Domain", path: "/publicdomain/zero/" },
  { key: "by-sa", label: "CC BY-SA", path: "/licenses/by-sa/" },
  { key: "by", label: "CC BY", path: "/licenses/by/" },
]

const rejectedMarkers = [
  { marker: "by-nc", reason: "NC licenses are not allowed on this commercial affiliate site." },
  { marker: "by-nd", reason: "ND licenses are not allowed because collected articles may be reformatted." },
  { marker: "by-nc-sa", reason: "NC licenses are not allowed on this commercial affiliate site." },
  { marker: "by-nc-nd", reason: "NC and ND licenses are not allowed." },
]

export function decideCollectorLicense(
  licenseUrls: string[],
  pageText: string
): CollectorLicenseDecision {
  const normalizedUrls = licenseUrls
    .map((url) => url.trim().toLowerCase())
    .filter(Boolean)
  const normalizedText = pageText.toLowerCase()
  const haystack = [...normalizedUrls, normalizedText].join(" ")

  for (const rejected of rejectedMarkers) {
    if (haystack.includes(rejected.marker)) {
      return {
        allowed: false,
        license: "",
        licenseUrl: "",
        reason: rejected.reason,
      }
    }
  }

  for (const license of allowedLicenses) {
    const url = normalizedUrls.find((item) => item.includes(license.path))

    if (url) {
      return {
        allowed: true,
        license: license.label,
        licenseUrl: url,
        reason: "Allowed license detected.",
      }
    }
  }

  if (haystack.includes("cc by-sa")) {
    return allowedTextDecision("CC BY-SA")
  }

  if (haystack.includes("cc by")) {
    return allowedTextDecision("CC BY")
  }

  if (haystack.includes("cc0") || haystack.includes("public domain dedication")) {
    return allowedTextDecision("CC0 / Public Domain")
  }

  return {
    allowed: false,
    license: "",
    licenseUrl: "",
    reason: "No allowed Creative Commons or public domain license was detected.",
  }
}

function allowedTextDecision(license: string): CollectorLicenseDecision {
  return {
    allowed: true,
    license,
    licenseUrl: "",
    reason: "Allowed license text detected, but no license URL was found.",
  }
}
