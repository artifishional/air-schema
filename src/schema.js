import {equalsubs, findAtSign} from "./utils"

export default class Schema {

    constructor([ name, props, ...next ]) {
        this.name = name;
        if(typeof props === "function") {
            this.filler = props;
            props = {};
        }
        if(Array.isArray(props)) {
            this.item = [ this.lift(props) ];
            this.props = {};
            this.item.push(...next.map( this.lift, this ));
        }
        else {
            this.item = next.map( this.lift, this );
            this.props = props;
        }
    }

    lift( data ) {
        return new Schema( data );
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
                exist ? exist.merge(item) : this.item.push( this.lift(item) );
            } );
        }
        else {
            throw new TypeError(`unsupported type '${type}'`);
        }
        return this;
    }

}