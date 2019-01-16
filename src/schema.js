import {equalsubs, findAtSign} from "./utils"
let ACID = 0;

export default class Schema extends Array {

    constructor(data) {
        const [ key, prop, ...item ] = Schema.normilize( data );

        if(prop.hasOwnProperty(1)) {
            debugger;
        }

        super( key, prop );
        this.acid = ++ACID;
        if(typeof prop === "function") {
            this.__activator = prop;
            this[1] = {};
        }
        this.layers = [ this ];
        this.push(...item.map( this.lift, this ));
    }

    get item() {
        return this.slice(2);
    }

    static get [Symbol.species]() {
        return Array;
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

    findByName(name) {
        throw "unused";
    }

    toJSON() {
        return [ this.name, this.prop, ...this.map( Schema.toJSON ) ];
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

    static normilize( [ key, prop, ...item ] ) {
        if(Array.isArray(prop)) {
            return [ key, {}, prop, ...item ];
        }
        return [ key, prop, ...item ];
    }

    merge( data, type = "one-by-one" ) {
        if(!(data instanceof Schema)) data = new Schema( data );
        this.layers.push( data );
        const [ key, prop, ...item ] = data;
        debugger;
        if(type === "one-by-one") {
            this[1] = {...this[1], ...prop};
            item.map( item => {
                const exist = this.item.find( ([ key ]) => item[0] === key );
                exist ? exist.merge(item) : this.push( this.lift(item) );
            } );
            debugger;
        }
        else {
            throw new TypeError(`unsupported merge "${type}" type`);
        }
        return this;
    }

}