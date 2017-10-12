/**
 * Generates a TypeScript interface for the resource at the given endpoint
 *
 * @param {string} url - The URL to fetch
 * @param {string} interfaceName - The interface name for this resource
 * @return {Promise<string>} - A Promise that resolves the transpiled source
 */
export default function gents(url: string, interfaceName: string): Promise<string>;
