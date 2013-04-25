"use strict";

(function(scope){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	var Class = function(){};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var proto = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {

			//check if we're setting a getter or a setter
			var p = Object.getOwnPropertyDescriptor(prop,name);
			if ( p.get || p.set ) {
				Object.defineProperty(proto,name,p);
				continue;
			}

			// Check if we're overwriting an existing function
			if(typeof prop[name] == "function"
				&& typeof _super[name] == "function"
				&& fnTest.test(prop[name]) )
			{
				proto[name] = (function(name, fn){
					return function() {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, prop[name]);
				continue;
			}

			proto[name] = prop[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = proto;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = proto.init;//Class;

		// And make this class extendable
		Class.extend = this.extend;//arguments.callee;

		return Class;
	};

	scope.Class = Class;
})(window ? window : global);//browser or node.js
