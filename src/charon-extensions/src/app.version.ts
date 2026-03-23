/**
 * Detects the Charon application version from the page DOM.
 * Checks `<meta name="app-version">` content attribute, then `document.body[data-app-version]`.
 * @returns The version string, or '0.0.0' if not found.
 */
export function getAppVersion(): string {
    // Try to get version from meta tag
    const metaTag = document.querySelector('meta[name="app-version"]');
    if (metaTag) {
        const version = metaTag.getAttribute('content');
        if (version) return version;
    }

    // Try to get version from body data attribute
    const bodyVersion = document.body.getAttribute('data-app-version');
    if (bodyVersion) return bodyVersion;

    // Return default version
    return '0.0.0';
}

/**
 * Compares two semantic version strings (e.g., "1.2.3-beta").
 * Pre-release suffixes (after '-') are ignored during comparison.
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if equal.
 */
export function compareAppVersions(version1: string, version2: string): number {
    // Extract numeric parts only (ignore suffixes like -beta, -alpha, etc.)
    const parseVersion = (version: string): number[] => {
        const numericPart = version.split('-')[0]; // Remove suffix
        return numericPart.split('.').map(num => parseInt(num, 10) || 0);
    };

    const v1Parts = parseVersion(version1);
    const v2Parts = parseVersion(version2);

    // Compare each part (major, minor, patch)
    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;

        if (v1Part > v2Part) return 1;
        if (v1Part < v2Part) return -1;
    }

    // Versions are equal
    return 0;
}
