const connection = require('./config/databaseConnection.js').createConnection();
const socket_listen = require('socket.io').listen
const mysql = require('mysql');

module.exports = (server) => {
  const io = socket_listen(server)

  io.on('connection',socket => {
    socket.on('pick', message => {
      check_pick(socket,message);
    })
    socket.on('supplemental_pick', message => {
      check_supplemental_pick(socket,message);
    })
  });
  
  async function pick(socket,message) {
    pick_select = `(SELECT current_pick FROM draft WHERE league_id = ${message.league_id} LIMIT 1)`;
    query =
    `
    INSERT INTO draft_picks (league_id, user_id, pick, school_id) VALUES (${message.league_id}, ${message.user.id}, ${pick_select}, ${message.school.id});
    UPDATE draft SET current_pick = current_pick + 1 WHERE league_id = ${message.league_id};
    `
    ;
  
    connection.query( query, function(error, results){
      if (error) {
        socket.emit(`error-${message.league_id}`, {message: 'there was an error'});
      } else {
        socket.emit(`draft-${message.league_id}`,{message: `${message.user.first} ${message.user.last} selected ${message.school.school}`, pick: message.pick+1, last_pick: {pick: message.pick, user: message.user, school: message.school}});
        socket.broadcast.emit(`draft-${message.league_id}`,{message: `${message.user.first} ${message.user.last} selected ${message.school.school}`, pick: message.pick+1, last_pick: {pick: message.pick, user: message.user, school: message.school}});
      }
    });
  }
  
  async function check_pick(socket,message) {
    league_id = mysql.escape(message.league_id);
    user_id   = mysql.escape(message.user.id);
    query = `SELECT current_pick, draft_order FROM draft WHERE league_id = ${league_id} LIMIT 1;`;
    connection.query( query, function(error, results){
      if (error) {
        socket.emit(`error-${message.league_id}`, {message: 'Selection Forbidden', pick: current_pick});
      } else {
        teams = results[0]['draft_order'].split('-');
        current_pick = results[0]['current_pick'];
        mod = (current_pick - 1) % (teams.length * 2);
        if (mod < teams.length) {
          index =  mod % teams.length;
        } else {
          index = (teams.length * 2 - 1 - mod) % teams.length;
        }
        if (teams[index] == user_id && (current_pick-1) / teams.length < 6) {
          pick(socket,message);
        } else {
          socket.emit(`error-${message.league_id}`, {message: 'Selection Forbidden', pick: current_pick});
        }
      }
    });
  }
  
  async function supplemental_pick(socket,message) {
    pick_select = `SELECT COUNT(*) FROM supplemental_reassignments WHERE league_id = ${message.league_id} AND new_school_id IS NOT NULL;`;
    query =
    `
    UPDATE supplemental_reassignments SET new_school_id = ${message.school.id} WHERE league_id = ${message.league_id} AND school_id = ${message.old_school_id};
    `
    ;
    connection.query( query, function(error, results){
      if (error) {
        socket.emit(`error-${message.league_id}`, {message: 'there was an error'});
      } else {
        socket.emit(`supplemental-${message.league_id}`,{message: `${message.user.first} ${message.user.last} selected ${message.school.school}`, pick: message.pick+1, last_pick: {pick: message.pick, user: message.user, school: message.school}});
        socket.broadcast.emit(`supplemental-${message.league_id}`,{message: `${message.user.first} ${message.user.last} selected ${message.school.school}`, pick: message.pick+1, last_pick: {pick: message.pick, user: message.user, school: message.school}});
      }
    });
  }
  
  async function check_supplemental_pick(socket,message) {
    league_id = mysql.escape(message.league_id);
    user_id   = mysql.escape(message.user.id);
    query = `SELECT * FROM supplemental_reassignments s, draft_picks d WHERE s.new_school_id IS NULL AND s.league_id = d.league_id AND s.school_id = d.school_id AND d.league_id = ${league_id} ORDER BY pick LIMIT 1;`;
    connection.query( query, function(error, results){
      if (error) {
        socket.emit(`error-${message.league_id}`, {message: 'Selection Forbidden', pick: results[0].pick});
      } else {
        if (message.pick == results[0].pick && user_id == results[0].user_id) {
          supplemental_pick(socket,message);
        } else {
          socket.emit(`error-${message.league_id}`, {message: 'Selection Forbidden', pick: results[0].pick});
        }
      }
    });
  }

  return server
}
