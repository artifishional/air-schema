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

export class Schema {

    constructor([ name, props, ...next ]) {
        this.name = name;
        if(typeof props === "function") {
            this.filler = props;
            props = {};
        }
        if(Array.isArray(props)) {
            this.item = [ new Schema(props) ];
            this.props = {};
            this.item.push(...next.map( Schema.create ));
        }
        else {
            this.item = next.map( Schema.create );
            this.props = props;
        }
    }

    static create(schema) {
        return new Schema(schema);
    }

    fill(schema) {
        if( !this.filler ) {
            return;
        }
        this.merge( this.filler(schema[1]) );
        return this;
    }

    static toJSON(node) {
        return node.toJSON();
    }

    find(name) {
        return this.item.find(({name: x}) => x === name);
    }

    toJSON() {
        return [ this.name, this.props, ...this.item.map( Schema.toJSON ) ];
    }

    mergeIfExistAt(nodes) {
        const exist = findAtSign(this.name, nodes);
        exist && this.merge(exist);
        return this;
    }

    subscription(nodes) {
        const exist = nodes.find( ([node]) => equalsubs(this.name, node) );
        exist && this.merge(exist);
        return this;
    }

    merge( [ sign, props, ...item ], type = "one-by-one" ) {
        if(type === "one-by-one") {
            this.props = {...this.props, ...props};
            item.map( item => {
                const exist = this.item.find( ({name}) => item[0] === name );
                exist ? exist.merge(item) : this.item.push( new Schema(item) );
            } );
        }
        else {
            throw new TypeError(`unsupported type '${type}'`);
        }
        return this;
    }

}