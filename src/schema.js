import {equalsubs, findAtSign} from "./utils"
let ACID = 0;

export default class Schema extends Array {

    constructor([ key, props, ...next ]) {
        super(2);
        let item = null;
        if(typeof props === "function") {
            this.__activator = props;
            props = {};
        }
        if(Array.isArray(props)) {
            this[2] = this.lift(props);
            this[1] = {};
        }
        else {
            this[1] = props;
        }
        this.push(...next.map( this.lift, this ));
    }

    get item() {
        return this.slice(2);
    }

    get prop() {
        return this[1];
    }

    lift( data ) {
        return new this.constructor( data );
    }

    activate(schema) {
        if( !this.__activator ) {
            return;
        }
        this.merge( this.__activator(schema[1]) );
        return this;
    }

    static toJSON(node) {
        return node.toJSON();
    }

    find(name) {
        return this.find(({name: x}) => x === name);
    }

    toJSON() {
        return [ this.name, this.props, ...this.map( Schema.toJSON ) ];
    }

    mergeIfExistAt(nodes) {
        const exist = findAtSign(this.name, nodes);
        exist && this.merge(exist);
        return this;
    }

    /**
     * @param {*} signature common data
     */
    getAtSignature( signature ) {

    }

    subscription(nodes) {
        const exist = nodes.find( ([node]) => equalsubs(this.name, node) );
        exist && this.merge(exist);
        return this;
    }

    merge( [ sign, props, ...item ], type = "one-by-one" ) {
        if(type === "one-by-one") {
            this[1] = {...this[1], ...props};
            item.map( item => {
                const exist = this.find( ([ key ]) => item[0] === key );
                exist ? exist.merge(item) : this.push( this.lift(item) );
            } );
        }
        else {
            throw new TypeError(`unsupported type '${type}'`);
        }
        return this;
    }

}