(function( $ ) {
	var cache =  {};
	$.widget("ui.combobox", {
		options: {
			cb: null,
			readonly: false,
			keys: {
				id: "id",
				name: "name"
			},
			dynamic: 0
		},
		_create: function() {
			cache = {};
			var self = this,
				select = this.element.hide(),
				action = select.data("action"),
				selected = (function(){
					var ret = select.children("[value="+select.data("val")+"]");
					if(ret.length > 0){
						ret.attr("selected","selected");
						return ret;
					}
					ret = select.children(":selected");
					return ret;
				})(),
				value = selected.val() ? selected.text() : "";

			if(select.data("id")){
				self.options.keys.id = select.data("id");
			}
			if(select.data("name")){
				self.options.keys.name = select.data("name");
			}
			if(select.data("name")){
				self.options.dynamic = select.data("dynamic");
			}
			if(select.data("groups")){
				self.options.groups = select.data("groups").split(",");
			}
			var inputBox = $( '<div class="inputBox"></div>' )
				.insertAfter( select );

			//self.options.cb = Templates.callBacks

			var input = this.input = $( "<input>" )
				.appendTo( inputBox )
				.val( value )
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: function( request, response ) {
						if(action){
							if(cache[request.term]){
								var data = cache[request.term];
								select.empty();
								for(var i=0; i<data.length; i++){
									select.append(data[i].option);
								}
								response(cache[request.term]);
								return;
							}
							var where = {type: action};
							where[self.options.keys.name] = request.term+"%";
							Content.load.acData(where,self.options.groups,function(data){
								var ret = [];
								for(var i=0; i<data.length; i++){
									if(typeof(self.options.filter) == "function"){
										if(self.options.filter(select.data("filterid"),data[i],ret) === false){
											return;
										}
									}


									var option = $('<option value="'+data[i][self.options.keys.id]+'">'+data[i][self.options.keys.id]+'</option>');
									select.append(option);
									ret.push({
										label: data[i][self.options.keys.name],
										value: data[i][self.options.keys.name],
										option: option[0]
									});

								}
								cache[request.term] = ret;
								response(ret);
							});
							return;
						}

						var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );

						var options = select.children( "option" );
						options.sort(function(a,b){
							return parseInt(b.value) - parseInt(a.value);
						});
						response( options.map(function() {
							var text = $( this ).text();
							if ( this.value && ( !request.term || matcher.test(text) ) ){
								return {
									label: text.replace(
										new RegExp(
											"(?![^&;]+;)(?!<[^<>]*)(" +
												$.ui.autocomplete.escapeRegex(request.term) +
												")(?![^<>]*>)(?![^&;]+;)", "gi"
										), "<strong>$1</strong>" ),
									value: text,
									option: this
								};
							}
						}) );
					},
					select: function( event, ui ) {
						ui.item.option.selected = true;
						self._trigger( "selected", event, {
							item: ui.item.option
						});
						if(typeof(self.options._cb) === "function"){
							self.options._cb($(ui.item.option).val());
						}

					},
					change: function( event, ui ) {
						cache = {};
						if ( !ui.item ) {
							var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" );
							var valid = false;

							select.children( "option" ).each(function() {
								if ( $( this ).text().match( matcher ) ) {
									this.selected = valid = true;
									return false;
								}
							});

							if ( !valid ) {
								if(self.options.dynamic === 1){
									var option = '<option>'+$(this).val()+'</option>';
									select.append(option);
									//option[0].selected = true;
									select.val($(this).val());
									self.options._cb($(this).val());
									return false;
								}
								// remove invalid value, as it didn't match anything
								$( this ).val( "" );
								select.val( "" );
								input.data( "autocomplete" ).term = "";
								return false;
							}
						}
						/*else{
							//console.warn("something wrong",ui);

						}*/
					},
					appendTo: inputBox
				})
				//.addClass( "ui-widget ui-widget-content ui-corner-left" )
				.on("click",function() {
					// close if already visible
					if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
						input.autocomplete( "close" );
						return;
					}
					// work around a bug (likely same cause as #5265)
					$( this ).blur();
					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					input.focus();
				})
				.on("focus",function() {
					cache = {};
					// work around a bug (likely same cause as #5265)
					//$(this).blur();
					if ( input.autocomplete( "widget" ).not( ":visible" ) ) {
						input.autocomplete( "search", "" );
						return;
					}
					// pass empty string as value to search for, displaying all results
					input.autocomplete("search", "");
					$(this).focus();
				});

			if(self.options.readonly != null){
				this.input.attr("readonly",self.options.readonly)
			}
			input.data( "autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li></li>" )
					.data( "item.autocomplete", item )
					.append( "<a>" + item.label + "</a>" )
					.appendTo( ul );
			};

			this.button = $( "<button type='button'>&nbsp;</button>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.insertAfter( input )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-button-icon ui-dd-button" )
				.on("click keyup",function() {
					// close if already visible
					if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
						input.autocomplete( "close" );
						return;
					}
					// work around a bug (likely same cause as #5265)
					$( this ).blur();
					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					input.focus();
			});


			//init once
			if(typeof self.options.cb === 'function'){
				self.options._cb = self.options.cb(select.data("cbid"));
				delete self.options.cb;
			}
			var val = select.data("val");// || value;
			if( typeof(self.options._cb) === "function"){
				if(val != "undefined"){
					self.options._cb(val);
				}
			}

		},
		destroy: function() {
			this.input.remove();
			this.button.remove();
			this.element.show();
			$.Widget.prototype.destroy.call( this );
		}
	});
})( jQuery );

(function($) {
	$.widget("ui.textmore", {
		_create: function() {

			var $parent = this.element.parent();
			var $clone = this.element.clone();
			$clone.val("");
			var $addButton = $parent.find(".addMore:first");
			$addButton.click(function(){
				$clone.clone().insertBefore($(this)).addClass("ui-widget ui-widget-content ui-corner-all");
			});
			$addButton.css("float","right");
		},
		destroy: function(){}
	});
})( jQuery );