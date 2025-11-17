interface Version {
  major: number
  minor: number
  patch: number
}

/**
 * Compares two versions of SPT
 *
 * @param condition version with condition (>=4.0.1, ~4.0.0, ...)
 * @param currentVersion current spt version (only digit and dots)
 */
export function checkVersion(
  condition: string,
  currentVersion: string
): boolean {
  // Parsing
  const parseVersion = (versionStr: string): Version => {
    const parts = versionStr.split('.').map((part) => parseInt(part, 10))
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    }
  }

  const current = parseVersion(currentVersion)

  // Version comparison function
  const compareVersions = (v1: Version, v2: Version): number => {
    if (v1.major !== v2.major) return v1.major - v2.major
    if (v1.minor !== v2.minor) return v1.minor - v2.minor
    return v1.patch - v2.patch
  }

  // Handling the ~ condition
  const processTilde = (condition: string): boolean => {
    const baseVersionStr = condition.substring(1)
    const baseVersion = parseVersion(baseVersionStr)

    // ~4 means >=4.0.0 <5.0.0
    // ~4.0.1 means >=4.0.1 <4.1.0
    if (baseVersionStr.split('.').length === 1) {
      // ~4
      return current.major === baseVersion.major
    } else {
      // ~4.0.1
      return (
        current.major === baseVersion.major &&
        current.minor === baseVersion.minor &&
        current.patch >= baseVersion.patch
      )
    }
  }

  // as is
  const processExact = (condition: string): boolean => {
    const targetVersion = parseVersion(condition)
    return compareVersions(current, targetVersion) === 0
  }

  // Operators
  const processComparison = (condition: string): boolean => {
    const operators = ['>=', '<=', '>', '<', '=']
    let operator = ''
    let versionStr = ''

    for (const op of operators) {
      if (condition.startsWith(op)) {
        operator = op
        versionStr = condition.substring(op.length).trim()
        break
      }
    }

    if (!operator) return false

    const targetVersion = parseVersion(versionStr)
    const comparison = compareVersions(current, targetVersion)

    switch (operator) {
      case '>=':
        return comparison >= 0
      case '<=':
        return comparison <= 0
      case '>':
        return comparison > 0
      case '<':
        return comparison < 0
      case '=':
        return comparison === 0
      default:
        return false
    }
  }

  // Several conditions
  const conditions = condition.split(' ').filter((c) => c.trim() !== '')

  // Check all conditions
  for (const cond of conditions) {
    let result = false

    if (cond.startsWith('~')) {
      result = processTilde(cond)
    } else if (cond.includes('>') || cond.includes('<') || cond.includes('=')) {
      result = processComparison(cond)
    } else {
      result = processExact(cond)
    }

    if (!result) {
      return false
    }
  }

  return true
}
