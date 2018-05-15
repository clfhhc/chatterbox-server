var app = {
  currentRoom: 'lobby',
};


$(document).ready(function() {
  app.init();
  app.fetch(app.renderRoom);
  app.fetch(app.renderMessage);
});




app.init = () => {
  
  
  $(document).on('click', '.username', function(e) {
    e.preventDefault();
    var $className = $(this).text();
    $('.' + $className).toggleClass('friend');

  });
  
  $('.submit').on('click', function(e) {
    e.preventDefault();
    app.fetch(app.handleSubmit);
  });
  $('.submitRoom').on('click', function(e) {
    e.preventDefault();
    
    var message = {
      username: 'default',
      text: undefined,
      roomname: 'lobby'
    };
    
    message.username = app.getUsername();
    message.roomname = $('#addRoom').val();
    
    app.send(message);
    app.fetch(app.renderMessage);
    app.fetch(app.renderRoom);
    
  });
  
  $('button').on('click', function(e) {
    e.preventDefault();
    app.fetch(app.renderMessage);
  });
   
  $('select').on('change', function(e) {
    e.preventDefault();
    app.currentRoom = $(this).val();
    app.fetch(app.renderMessageByRoom, app.currentRoom);
    
  }); 
};


app.send = (message) => {
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      console.log('chatterbox: Message sent');
    },
    error: (data) => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
  
};

app.fetch = (callback, arg) => {
  $.ajax({
    url: 'http://127.0.0.1:3000/classes/messages',
    type: 'GET',
    dataType: 'json',
    data: 'order=-createdAt',
    success: (data) => {
      
      console.log('chatterbox: Message received');
      app.clearMessages();
      callback(data.results, arg);

    },
    error: function (data) {
      console.error('chatterbox: Failed to get message', data);
      
    }
  }); 
};

app.clearMessages = function() {
  $('#chats').html('');
};

app.renderMessage = (message) => {
  message.forEach(function(eachMessage) {
    if (!JSON.stringify(eachMessage).includes('<', '>', '&', '%', '\"', '\'')) {    
      var username = $('<a href="#" class="username"></a>').text(eachMessage.username);
      var messageText = $('<div class="messages"></div>').text(eachMessage.text).addClass(eachMessage.username);
      
      $('#chats').append(username);
      $('#chats').append(messageText);
    }
    
  });
  
};


app.renderRoom = (message) => {
  var uniqueRooms = {};
  message.forEach(function(eachMessage) {
    if (!uniqueRooms[eachMessage.roomname] && eachMessage.roomname) {
      uniqueRooms[eachMessage.roomname] = true;
      var room = $('<option class=' + eachMessage.roomname + '></option>').text(eachMessage.roomname);
      $('#roomSelect').append(room);
    }
  });
};

app.handleSubmit = () => {
  
  var message = {
    username: 'default',
    text: undefined,
    roomname: 'lobby'
  };
  message.username = app.getUsername();
  message.text = app.getMessage();
  message.roomname = app.currentRoom;
  app.clearMessages();
  app.send(message);
  app.fetch(app.renderMessageByRoom, app.currentRoom);
};

app.getUsername = () => {
  var username = window.location.search.substring(10).split('');
  for (let i = 0; i < username.length; i ++) {
    if (username[i] === '%') {
      username.splice(i, 3, ' ');
    }
  }
  return username.join('');
};

app.getMessage = () => {
  return $('#send').val();
};


app.renderMessageByRoom = (message, currentRoom) => {
  var filteredRoom = message.filter(function(eachMessage) {
    return eachMessage.roomname === currentRoom;
  });
  app.renderMessage(filteredRoom);
};













