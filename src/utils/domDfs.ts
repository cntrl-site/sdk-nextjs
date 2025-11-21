export function domDfs(root: Element[], visitor: (element: Element) => void) {
  const q: Element[] = root;
  for (let i = 0; i < q.length; i += 1) {
    if (q[i].children.length > 0) {
      q.push(...q[i].children);
    }
  }
  for (let i = q.length - 1; i >= 0; i -= 1) {
    visitor(q[i]);
  }
}
