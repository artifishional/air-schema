export function equalSign(sign, node) {
  if (sign === '*') return true;
  if (typeof sign === 'object') {
    return Object.keys(sign).every((key) => equalSign(sign[key], node[key]));
  } if (typeof sign === 'string') {
    return new RegExp(`^${sign}$`).test(node);
  }
  return sign === node;
}

export function findAtSign(sign, nodes) {
  return nodes.find(([node]) => equalSign(sign, node));
}

export function equalsubs(subs, node) {
  if (node === '*') return true;
  if (typeof subs === 'object') {
    return Object.keys(node).every((key) => equalsubs(subs[key], node[key]));
  } if (typeof subs === 'string') {
    return new RegExp(`^${node}$`).test(subs);
  }
  return subs === node;
}

export function equal(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a)) {
    return a.length === b.length && a.every((a, i) => equal(a, b[i]));
  } if (
    typeof a === 'object' && a !== null && b !== null && a.constructor === Object
  ) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return keysA.length === keysB.length
        && keysA.every((k) => equal(a[k], b[k]));
  }
  return false;
}
