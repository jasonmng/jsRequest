jsRequest
=========

A jQuery ajax wrapper

# Reason for being

This module was created to accomplish three things: 

- create a central store where you can reference url's by friendlier names, which also provides a single place to edit your urls.
- Make ajax calls a *little* bit more cleaner looking.
- Create re-usable requests.


# Sample Use

````
   function displayImages( resp ) { … }
````

### Using Flicker API old way

````
   $.ajax({
      url: 'https://api.flickr.com/services/rest',
      data: {
         method: 'flickr.photos.search',
         tags: 'buildings',
         api_key: 'xxxxxxxxxx',
         format: 'json',
         per_page: '1',
         page: 1
      },
      jsonpCallback: 'jsonFlickrApi',
      format: 'json',
      dataType: 'jsonp',
      type: 'GET'
   }).success(displayImages);
````


### Using Flicker API new way

````
   request.add('flickr_search','https://api.flickr.com/services/rest');

   var buildings = request.fetch('flickr_search').data({
      method: 'flickr.photos.search',
      tags: 'buildings',
      api_key: 'xxxxxxxxxx',
      format: 'json',
      per_page: '1',
      page: 1
   }).options({
      jsonpCallback: 'jsonFlickrApi'
   }).jsonp().success( displayImages );
````


### How would you create a subsequent request? for page 2 data?

   - Old way: wrap the request into a function yourself that can be called when your ready

   - New way: buildings.data({ page: 2 }).jsonp().success( displayImages );


# Other Use Examples

````
   request.add('daily_report', 'http://www.example.com/reports/daily');

   request.fetch('daily_report').append('format/json').get();

      produces a get request to: http://www.example.com/reports/daily/format/json

   request.fetch('daily_report').data('format','json').post().success( cb, this ).fail( cb, this );
````

````
   request.add('daily_report', 'http://www.example.com/reports/{1}/format/{2}');

   request.fetch('daily_report').replace('daily','json').get();

      produces a get request to: http://www.example.com/reports/daily/format/json
````
