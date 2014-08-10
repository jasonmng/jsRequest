'use strict';

(function(root, factory){

  if (typeof define === 'function' && define.amd) {

    define(['jquery'], function( $ ) { return factory( root, $ ); });

  } else if (typeof exports !== 'undefined') {

    var $ = require('jquery'); 
    module.exports = factory( root, $ );

  } else {

    if ( root.$ === undefined || root._ === undefined ) {

      console.log('Unable to load request module: missing dependencies');

    } else {
       
      var previousRequest = root.request, request = factory( root, root.$ );

      request.noConflict = function(){
         root.request = previousRequest;
         return request;
      }

      root.request = request;
    }
  }
  

})( window, function( root, $ ){

   var _ = {};

   if (!String.prototype.trim) {
      String.prototype.trim = function(){
         var text = this.replace(/^\s+/,"");
         for (var i = text.length - 1; i >= 0; i--) {
            if (/\S/.test(text.charAt(i))) {
               text = text.substring(0, i + 1);
               break;
            }
         }
         return text;
      }
   }

   var ArrayProto = Array.prototype;
   var slice = ArrayProto.slice;
   var nativeForEach = ArrayProto.forEach;

   if ( root._ === undefined || root._.defaults === undefined ) {

     _.defaults = function(obj) {
       _.each(slice.call(arguments, 1), function(source) {
         if (source) {
           for (var prop in source) {
             if (obj[prop] === void 0) obj[prop] = source[prop];
           }
         }
       });
       return obj;
     };
      
   } else {

      _.defaults = root._.defaults;

   }
   if ( root._ === undefined || root._.extend === undefined ) {

      _.extend = function(obj) {
         _.each(slice.call(arguments, 1), function(source) {

            if (source) {
               for (var prop in source) {
                  obj[prop] = source[prop];
               }
            }
         });
         return obj;
      }


   } else {
      _.extend = root._.extend;
   }
   if ( root._ === undefined || root._.each === undefined ) {

      _.each = function(obj, iterator, context) {
       if (obj == null) return obj;
       if (nativeForEach && obj.forEach === nativeForEach) {
         obj.forEach(iterator, context);
       } else if (obj.length === +obj.length) {
         for (var i = 0, length = obj.length; i < length; i++) {
           if (iterator.call(context, obj[i], i, obj) === breaker) return;
         }
       } else {
         var keys = _.keys(obj);
         for (var i = 0, length = keys.length; i < length; i++) {
           if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
       }
       return obj;
      };
   }
   
   var ajax = $.ajax;

   var url = function( url ){

      this._url = this.url = this._clean(url, true, false );
      this._data = {};
      this._options = {};

      this.dfd = false;
   }

   url.prototype = {

      reset: function(){

         this.url = this._url;
         this._data = {};
         this._options = {};
         this.dfd = false;

      },

      /* 
       * removes beginning and ending whitespace
       * removes beginning and ending url slashes
       *------------------------------------------*/
      
      _clean: function( url, ignoreFSlash, ignoreBSlash ) {

         url = url.trim();

         if ( !ignoreFSlash ) {
            if ( url.charAt(0) == '/' ) {
               url = url.substring(1);
            } 
         }

         if ( !ignoreBSlash ) {
            if ( url.charAt(url.length-1) == '/' ) {
               url = url.substring(0,url.length-1);
            }
         }

         return url.trim();

      },

      /* 
       * Allows you to use urls like: /example/{1}
       * and insert values with replace( test ), which
       * returns /example/test
       *-------------------------------------------*/
      replace: function() {

          var args = arguments;

          this.url = this.url.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined' ? args[number] : match;
          });
         
         return this;

      },

      append: function( part ){

         if ( !part ) return;
         part = this._clean( part );
         this.url += '/'+part;
         return this;
      },

      data: function( obj ) {

         var args = Array.prototype.slice.call(arguments);

         if ( args.length == 2 ) {
            this._data[args[0]] = args[1];
         } else if ( obj === Object(obj) ){
            this._data = _.extend( this._data, obj );
         }

         return this;

      },

      options: function( obj ) {
         this._options = _.extend( this._options, obj );
         return this;
      },

     
      /* 
       *  Providing a method means you are going to send 
       *  the request via "method" but have it behave as 
       *  if it were a GET request
       *
       *--------------------------------------------------*/

      get: function( method ){

         if ( method ) {
            this.options({headers: {'X-HTTP-Method-Override': 'GET'}, type: method});
            this.data({'_method': 'GET'});
         }

         var defaults = { url: this.url, type: 'GET', format: 'json', data: this._data },
             options  = _.defaults( this._options, defaults );

         this.dfd = ajax(options);

         return this;

      },

      post: function( method ){

         this.reset();

         if ( method ) {
            this.options({'X-HTTP-Method-Override': 'POST',type: method});
            this.data({'_method': 'POST'});
         }

         var defaults = { url: this.url, type: 'POST', format: 'json', data: this._data },
             options  = _.defaults( this._options, defaults );

         this.dfd = ajax(options);

         return this;

      },

      delete: function( method ){

         if ( method ) {
            this.options({'X-HTTP-Method-Override': 'DELETE',type: method});
            this.data({'_method': 'DELETE'});
         }

         var defaults = { url: this.url, type: 'DELETE', format: 'json', data: this._data },
             options  = _.defaults( this._options, defaults );

         this.dfd = ajax(options);

         return this;

      },

      put: function( method ){

         if ( method ) {
            this.options({'X-HTTP-Method-Override': 'PUT',type: method});
            this.data({'_method': 'PUT'});
         }

         var defaults = { url: this.url, type: 'PUT', format: 'json', data: this._data },
             options  = _.defaults( this._options, defaults );

         this.dfd = ajax(options);

         return this;

      },

      jsonp: function( cb, ctx ) {

         var defaults = { url: this.url, dataType: 'jsonp', format: 'json', type: 'GET', data: this._data },
             options  = _.defaults( this._options, defaults );

         this.dfd = ajax(options);

         return this;

      },

      success: function( cb, ctx ){

         if ( ctx ) {
            this.dfd.done( function(){cb.apply( ctx, arguments )} );
         } else {
            this.dfd.done( cb );
         }

         return this;

      },

      fail: function( cb, ctx ){

         if ( ctx ) {
            this.dfd.fail( function(){cb.apply( ctx, arguments )} );
         } else {
            this.dfd.fail( cb );
         }

         return this;

      }

   };

   var request = function(){
      this.locations = {};
   }

   request.prototype = {
   
      add: function( name, url ) {
         this.locations[name] = url;
         return this;
      },

      fetch: function( endpoint ) {

         var loc = this.locations[endpoint];

         if ( loc ) {
            return new url( loc );
         } else {
            return new url( endpoint );
         }

      },

   };

   return new request();

});
