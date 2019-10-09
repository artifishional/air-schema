import { findAtSign, equal } from './utils';

let ACID = 0;

function normilize ([key, prop, ...item]) {
  if (Array.isArray(prop)) {
    return [key, {}, prop, ...item];
  }
  return [key, prop, ...item];
}

export default class Schema extends Array {

  constructor (data, src) {
    const [key, prop, ...item] = normilize(data);
    super(key, prop);
    this.acid = ++ACID;
    if (typeof prop === 'function') {
      this.__activator = prop;
      this[1] = {};
    }
    this.leadlayer = this;
    this.layers = [this];
    this.item = [];
    this.resourceloader = src.resourceloader;
    this.append(...item);
  }

  static get [Symbol.species] () {
    return Array;
  }

  get prop () {
    return this[1];
  }

  get key () {
    return this[0];
  }

  static toJSON (node) {
    return node.toJSON();
  }

  lift (data, src, origin) {
    return new this.constructor(data, src, origin);
  }

  parse (data, src) {
    if (typeof data === 'string') {
      return this.lift(JSON.parse(data), src);
    } else {
      return this.lift(data, src);
    }
  }

  appendData ({ data, pack }, src) {
    let res = null;
    if (data.prototype instanceof Schema) {
      res = new data([], src, { pack });
    } else {
      res = this.parse(data, src, { pack });
    }
    this.merge(res);
  }

  append (...item) {
    item.map(item => {
      if (!(item instanceof Schema)) {
        item = this.parse(item, this);
      }
      const exist = this.item.find(([key]) => equal(item[0], key));
      exist ? exist.merge(item) : this.push(item);
    });
  }

  findByAcid (acid) {
    if (this.layers.some(({ acid: x }) => x === acid)) {
      return this;
    } else {
      for (let i = 0; i < this.item.length; i++) {
        const res = this.item[i].findByAcid(acid);
        if (res) {
          return res;
        }
      }
    }
    return null;
  }

  push (...item) {
    this.item.push(...item);
    super.push(...item);
  }

  activate (schema) {
    if (!this.__activator) {
      return;
    }
    this.merge(this.__activator(schema[1]));
    return this;
  }

  acidis (name) {
    return (this.acid + '').indexOf(name) > -1;
  }

  toJSON () {
    return [this.key, this.prop, ...this.slice(2).map(Schema.toJSON)];
  }

  mergeIfExistAt (nodes) {
    const exist = findAtSign(this.name, nodes);
    exist && this.merge(exist);
    return this;
  }

  mergeProperties (name, value) {
    return value;
  }

  setLeadLayer (leadlayer) {
    this.leadlayer = leadlayer;
  }

  merge (data, hasUseDefaultLayer = false) {
    if (!(data instanceof Schema)) data = new Schema(data);
    this.layers.push(data);
    if(!hasUseDefaultLayer) {
	    data.setLeadLayer(this.leadlayer);
    }
    const [key, prop, ...item] = data;
    Object.keys(prop).map(name => {
      this.prop[name] = this.mergeProperties(name, prop[name]);
    });
    this.append(...item);
    return this;
  }

}