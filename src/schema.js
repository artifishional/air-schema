import {findAtSign, equal} from "./utils"
let ACID = 0;

function normilize( [ key, prop, ...item ] ) {
	if(Array.isArray(prop)) {
		return [ key, {}, prop, ...item ];
	}
	return [ key, prop, ...item ];
}

export default class Schema extends Array {

    constructor(data, src, { acid = "", pack } = {}) {
        const [ key, prop, ...item ] = normilize( data );
        super( key, prop );
        this.acid = acid ? `${++ACID}/${acid}` : ++ACID;
        if(typeof prop === "function") {
            this.__activator = prop;
            this[1] = {};
        }
        this.layers = [ this ];
        this.append( ...item );
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

    lift( data, src, origin ) {
        return new this.constructor( data, src, origin );
    }
	
	parse(data, src) {
		if(typeof data === "string") {
			return this.lift( JSON.parse(data), src );
		}
		else {
			return this.lift( data, src );
		}
    }
	
	appendData( { data, pack } ) {
        let res = null;
		if(data.prototype instanceof Schema) {
			res = new data( [], this.src, { pack } );
		}
		else {
			res = this.parse( data, this.src, { pack } );
		}
		this.merge( res );
    }
	
	append( ...item ) {
		item.map( item => {
		    if(!(item instanceof Schema)) {
                item = this.parse( item, this );
            }
			const exist = this.item.find( ([ key ]) => equal(item[0], key) );
			exist ? exist.merge(item) : this.push( item );
		} );
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

    toJSON() {
        return [ this.key, this.prop, ...this.slice(2).map( Schema.toJSON ) ];
    }
    
    get key() {
        return this[0];
    }
    
    mergeIfExistAt(nodes) {
        const exist = findAtSign(this.name, nodes);
        exist && this.merge(exist);
        return this;
    }
	
	mergeProperties( name, value ) {
        return value;
    }

    merge( data ) {
        if(!(data instanceof Schema)) data = new Schema( data );
        this.layers.push( data );
        const [ key, prop, ...item ] = data;
        Object.keys(prop).map( name => {
	        this.prop[name] = this.mergeProperties( name, prop[name] );
        } );
        this.append( ...item );
        return this;
    }

}