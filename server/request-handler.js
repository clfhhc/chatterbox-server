/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');

var serverData = [];

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  // if (request.method === 'POST') {
  //   request.on('data',function(data){
  //     console.log(data.toString('utf-8'));
  //     console.log('----------------------------------------------------------->')
  //   })
  // }
  
  var urlParts = url.parse(request.url);
  
  var routes = {
    '/classes/messages': true,
  };           
  
  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;
  
  var sendResponse = function(response, data, statusCode, dataType) {
    
    dataType = dataType || 'text/plain';
    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = dataType;
    // The outgoing status.
    statusCode = statusCode || 200;
    var results = {results: data};
    
    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);
    
    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    // response.end('Hello, World!');
  
    response.end(JSON.stringify(results));
    
  };                                             
  
  // if (!routes[urlParts.pathname]) {
  //   sendResponse(reponse, 'Not Found', 404);  
  // } else {
  //   if(request.method !== 'GET') {
  //     sendResponse(reponse, 'Not Found', 404);  
  //   }
  // }
  
  var successResponse = false;
  
  if (routes[urlParts.pathname] && request.method === 'POST') {
    request.on('data', function(data) {
      serverData.push(JSON.parse(data));
    });
    sendResponse(response, 'Posted!', 201); 
    successResponse = true; 
  }
  
  if (routes[urlParts.pathname] && request.method === 'GET') {
    
    sendResponse(response, serverData, 200); 
    successResponse = true; 
  }

  (successResponse) || (sendResponse(response, 'Not Found', 404));
  
  
  // sendResponse(response, {results:['Hello world!']},200,'application/json');
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
// var defaultCorsHeaders = {
//   'access-control-allow-origin': '*',
//   'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'access-control-allow-headers': 'content-type, accept',
//   'access-control-max-age': 10 // Seconds.
// };

exports.requestHandler = requestHandler;

