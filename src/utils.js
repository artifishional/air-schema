export function findAtSign( sign, nodes ) {
    return nodes.find( ([node]) => equalSign(sign, node) );
}

export function equalSign(sign, node) {
    if(sign === "*") return true;
    if(typeof sign === "object") {
        return Object.keys( sign ).every( key => equalSign( sign[key], node[key]) );
    }
    else if(typeof sign === "string") {
        return new RegExp(`^${sign}$`).test(node);
    }
    else {
        return sign === node;
    }
}

export function equalsubs(subs, node) {
    if(node === "*") return true;
    if(typeof subs === "object") {
        return Object.keys( node ).every( key => equalsubs( subs[key], node[key]) );
    }
    else if(typeof subs === "string") {
        return new RegExp(`^${node}$`).test(subs);
    }
    else {
        return subs === node;
    }
}