// YOUR CODE HERE:
var app = {};

app.server = 'http://127.0.0.1:3000/classes/messages';
app.data = [];
app.rooms = {};
app.friends = {};

app.init = function() {
  //Adding username click event handlers
  //check if an event has been attached
  let events = $._data(document.getElementById('main'), 'events');
  let hasEvents = (events != null);
  //Add event if no event attached;
  if (!hasEvents) {
    $('#main').on('click', '.username', function(event) {
      app.handleUsernameClick(this.innerText);
    });
  }
  
  //Adding submit click event handlers
  //check if an event has been attached
  events = $._data(document.getElementById('send'), 'events');
  hasEvents = (events != null);
  //Add event if no event attached;
  if (!hasEvents) {
    $('#send').on('submit', function(event) {
      event.preventDefault();
      $('#message').val().length > 0 && app.handleSubmit();
    });
  }
  
  //Adding roomSelect click event handlers
  //check if an event has been attached
  events = $._data(document.getElementById('roomSelect'), 'events');
  hasEvents = (events != null);
  //Add event if no event attached;
  if (!hasEvents) {
    $('#roomSelect').on('change', function(event) {
      app.fetch(100);
    });
  }
  app.fetch(100);
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message), //make sure the request body is stringified
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(limit) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'GET',
    //data: ,
    contentType: 'application/json',
    data: {
      limit: limit,
      order: '-createdAt'
      
    },
    success: function (data) {
      console.log('chatterbox: Message fetched');
      app.data = data.results;
      app.clearMessages();
      app.clearUsername();
      app.rooms = {};
      for (var i = 0; i < data.results.length; i++) {
        if (data.results[i].username) {
          
          if (data.results[i].roomname) {
            //escape the messages we fetched
            data.results[i].text = _.escape(data.results[i].text).slice(undefined, 200);
            data.results[i].username = _.escape(data.results[i].username).slice(undefined, 20);
            data.results[i].roomname = _.escape(data.results[i].roomname).slice(undefined, 20);
            if (!app.friends.hasOwnProperty(data.results[i].username)) {
              app.friends[data.results[i].username] = false;
            }
            if (data.results[i].hasOwnProperty('roomname')) {
              if (app.rooms.hasOwnProperty(data.results[i].roomname)) {
                app.rooms[data.results[i].roomname].push(data.results[i]);
              } else {
                app.rooms[data.results[i].roomname] = [data.results[i]];
              }
            }
          }
        }
      }
      
      
      let roomname = $('#roomSelect').val();
      app.renderRoom();
      if (app.rooms.hasOwnProperty(roomname)) {
        $('#roomSelect').val(roomname);
        
      }
      $('#roomset').val($('#roomSelect').val());
      app.renderMessageBaseOnRoom($('#roomSelect').val());
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to fetch message', data);
    }
  });
};
app.clearMessages = function() {
  $( '#chats' ).empty();
};
app.renderMessage = function(message) {
  var chat = document.createElement('div');
  chat.className = 'chat';
  
  var node = document.createElement('div');
  node.innerHTML = message.username + ':';
  node.className = 'username';
  if (app.friends[message.username]) {
    node.classList.add('friended');
  }
  $(chat).append(node);
  
  if ($(`#main .username:contains('${message.username}')`).length === 0) {
    
    let node2 = document.createElement('span');
    node2.className = 'username';
    if (app.friends[message.username]) {
      node2.classList.add('friended');
    }
    node2.innerHTML = message.username;
    $('#main .usernameList').append(node2);
  }
 
  node = document.createElement('div');
  node.innerHTML = message.text;
  $(chat).append(node);
  
  node = document.createElement('div');
  node.innerHTML = new Date(message.createdAt).toTimeString();
  node.className = 'time';
  $(chat).append(node);
  $('#chats').append(chat);
  $('#chats').append('<br>');
  
};

app.renderMessageBaseOnRoom = function(roomname) {
  if (app.rooms.hasOwnProperty(roomname)) {
    for (let message of app.rooms[roomname]) {
      app.renderMessage(message);
    }
  }
};

app.renderRoom = function(roomString) {
  $( '#roomSelect' ).empty();
  for (let room of Object.keys(app.rooms)) {
    let node = document.createElement('option');
    node.innerHTML = room;
    node.value = room;
    $('#roomSelect').append(node);
  }
};

app.handleUsernameClick = function(username) {
  if (app.friends[username]) {
    app.friends[username] = false;
    Array.prototype.forEach.call($(`#main .username:contains('${username}')`), function(item) {
      item.classList.remove('friended');
    });
    Array.prototype.forEach.call($(`#chats .username:contains('${username}')`), function(item) {
      item.classList.remove('friended');
    });
  } else {
    
    app.friends[username] = true;
    Array.prototype.forEach.call($(`#main .username:contains('${username}')`), function(item) {
      item.classList.add('friended');
    });
    Array.prototype.forEach.call($(`#chats :contains('${username}')`), function(item) {
      item.classList.add('friended');
    });

  }

};

app.handleSubmit = function() {
  var message = {
    username: window.location.search.slice(window.location.search.indexOf('username=') + 9),
    text: $('#message').val(),
    roomname: $('#roomset').val()
  };
  app.send(message);
  setTimeout(app.fetch.bind(null, 100), 500);
};

app.clearUsername = function() {
  $( '#main .usernameList' ).empty();
};