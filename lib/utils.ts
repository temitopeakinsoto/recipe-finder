/**
 * Remove an item from an array (immutable)
 *
 * @param array - Source array
 * @param item - Item to remove
 * @returns New array without the specified item
 *
 * @example
 * removeFromArray(['a', 'b', 'c'], 'b')
 * // Returns: ['a', 'c']
 */
export function removeFromArray<T>(array: T[], item: T): T[] {
  return array.filter((i) => i !== item);
}
