﻿/**
 * Commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are commands. For instance, you can define the command 'whois'
 * here, then use it by typing /whois into Pokemon Showdown.
 *
 * A command can be in the form:
 *   ip: 'whois',
 * This is called an alias: it makes it so /ip does the same thing as
 * /whois.
 *
 * But to actually define a command, it's a function:
 *   birkal: function(target, room, user) {
 *     this.sendReply("It's not funny anymore.");
 *   },
 *
 * Commands are actually passed five parameters:
 *   function(target, room, user, connection, cmd, message)
 * Most of the time, you only need the first three, though.
 *
 * target = the part of the message after the command
 * room = the room object the message was sent to
 *   The room name is room.id
 * user = the user object that sent the message
 *   The user's name is user.name
 * connection = the connection that the message was sent from
 * cmd = the name of the command
 * message = the entire message sent by the user
 *
 * If a user types in "/msg zarel, hello"
 *   target = "zarel, hello"
 *   cmd = "msg"
 *   message = "/msg zarel, hello"
 *
 * Commands return the message the user should say. If they don't
 * return anything or return something falsy, the user won't say
 * anything.
 *
 * Commands have access to the following functions:
 *
 * this.sendReply(message)
 *   Sends a message back to the room the user typed the command into.
 *
 * this.sendReplyBox(html)
 *   Same as sendReply, but shows it in a box, and you can put HTML in
 *   it.
 *
 * this.popupReply(message)
 *   Shows a popup in the window the user typed the command into.
 *
 * this.add(message)
 *   Adds a message to the room so that everyone can see it.
 *   This is like this.sendReply, except everyone in the room gets it,
 *   instead of just the user that typed the command.
 *
 * this.send(message)
 *   Sends a message to the room so that everyone can see it.
 *   This is like this.add, except it's not logged, and users who join
 *   the room later won't see it in the log, and if it's a battle, it
 *   won't show up in saved replays.
 *   You USUALLY want to use this.add instead.
 *
 * this.logEntry(message)
 *   Log a message to the room's log without sending it to anyone. This
 *   is like this.add, except no one will see it.
 *
 * this.addModCommand(message)
 *   Like this.add, but also logs the message to the moderator log
 *   which can be seen with /modlog.
 *
 * this.logModCommand(message)
 *   Like this.addModCommand, except users in the room won't see it.
 *
 * this.can(permission)
 * this.can(permission, targetUser)
 *   Checks if the user has the permission to do something, or if a
 *   targetUser is passed, check if the user has permission to do
 *   it to that user. Will automatically give the user an "Access
 *   denied" message if the user doesn't have permission: use
 *   user.can() if you don't want that message.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.can('potd')) return false;
 *
 * this.canBroadcast()
 *   Signifies that a message can be broadcast, as long as the user
 *   has permission to. This will check to see if the user used
 *   "!command" instead of "/command". If so, it will check to see
 *   if the user has permission to broadcast (by default, voice+ can),
 *   and return false if not. Otherwise, it will set it up so that
 *   this.sendReply and this.sendReplyBox will broadcast to the room
 *   instead of just the user that used the command.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canBroadcast()) return false;
 *
 * this.canTalk()
 *   Checks to see if the user can speak in the room. Returns false
 *   if the user can't speak (is muted, the room has modchat on, etc),
 *   or true otherwise.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canTalk()) return false;
 *
 * this.canTalk(message)
 *   Checks to see if the user can say the message. In addition to
 *   running the checks from this.canTalk(), it also checks to see if
 *   the message has any banned words or is too long. Returns the
 *   filtered message, or a falsy value if the user can't speak.
 *
 *   Should usually be near the top of the command, like:
 *     target = this.canTalk(target);
 *     if (!target) return false;
 *
 * this.parse(message)
 *   Runs the message as if the user had typed it in.
 *
 *   Mostly useful for giving help messages, like for commands that
 *   require a target:
 *     if (!target) return this.parse('/help msg');
 *
 *   After 10 levels of recursion (calling this.parse from a command
 *   called by this.parse from a command called by this.parse etc)
 *   we will assume it's a bug in your command and error out.
 *
 * this.targetUserOrSelf(target)
 *   If target is blank, returns the user that sent the message.
 *   Otherwise, returns the user with the username in target, or
 *   a falsy value if no user with that username exists.
 *
 * this.splitTarget(target)
 *   Splits a target in the form "user, message" into its
 *   constituent parts. Returns message, and sets this.targetUser to
 *   the user, and this.targetUsername to the username.
 *
 *   Remember to check if this.targetUser exists before going further.
 *
 * Unless otherwise specified, these functions will return undefined,
 * so you can return this.sendReply or something to send a reply and
 * stop the command there.
 *
 * @license MIT license
 */

var commands = exports.commands = {

	desatorar: 'unstuck',
	unstuck: function(target, room, user) {
		if (!this.can('hotpatch')) return;
		for (var uid in Users.users) {
			Users.users[uid].chatQueue = null;
			Users.users[uid].chatQueueTimeout = null;
		}
	},

	roomkick: function(target, room, user) {
	    target = toId(target);
	    targetUser = Users.get(target);
	    if (!targetUser || !targetUser.connected) return this.sendReply('Ese usuario no existe o no esta activo');
	    if (user.can('ban', targetUser)) var allowed = true;
	    if (!allowed && room.auth && room.auth[user.userid] === '#') var allowed = true;
	    if (!allowed && room.auth && room.auth[user.userid] === '%' && room.auth[targetUser.userid] !== '#' && room.auth[targetUser.userid] !== '%') var allowed = true;
	    if (!allowed) return this.sendReply('No tienes suficiente poder para utilizar este comando');
	    if (!room.users[target]) return this.sendReply('Ese usuario no esta en esta sala');
	    targetUser.leaveRoom(room);
	    room.addRaw(user.name + ' ha expulsado a ' + targetUser.name + ' del canal.');
	},
	kickall: function(target, room, user) {
	    target = toId(target);
	    targetUser = Users.get(target);
	    if (!targetUser || !targetUser.connected) return this.sendReply('Ese usuario no existe o no esta activo');
	    if (!user.can('ban', targetUser)) return this.sendReply('No tienes suficiente poder para utilizar este comando');
	    targetUser.disconnectAll();
	    room.addRaw(user.name + ' ha expulsado a ' + targetUser.name + ' del servidor.');
	    if (Rooms.rooms.staff) Rooms.rooms.staff.addRaw(user.name + ' ha expulsado a ' + targetUser.name + ' del servidor.');
	},

	ip: 'whois',
	getip: 'whois',
	rooms: 'whois',
	altcheck: 'whois',
	alt: 'whois',
	alts: 'whois',
	getalts: 'whois',
	whois: function(target, room, user) {
		var targetUser = this.targetUserOrSelf(target);
		if (!targetUser) {
			return this.sendReply('El usuario '+this.targetUsername+' no ha sido encontrado.');
		}

		this.sendReply('Nombre de Usuario: '+targetUser.name);
		if (user.can('Cuentas Alternativas:', targetUser.getHighestRankedAlt())) {
			var alts = targetUser.getAlts();
			var output = '';
			for (var i in targetUser.prevNames) {
				if (output) output += ", ";
				output += targetUser.prevNames[i];
			}
			if (output) this.sendReply('Nombres Anteriores: '+output);

			for (var j=0; j<alts.length; j++) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;

				this.sendReply('Cuenta Alternativa: '+targetAlt.name);
				output = '';
				for (var i in targetAlt.prevNames) {
					if (output) output += ", ";
					output += targetAlt.prevNames[i];
				}
				if (output) this.sendReply('Nombres Anteriores: '+output);
			}
		}
		if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			this.sendReply('Rango: ' + config.groups[targetUser.group].name + ' (' + targetUser.group + ')');
		}
		if (targetUser.staffAccess) {
			this.sendReply('(Pok\xE9mon Showdown Development Staff)');
		}
		if (!targetUser.authenticated) {
			this.sendReply('(No-registrado)');
		}
		if (!this.broadcasting && user.can('ip', targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply('IP' + ((ips.length > 1) ? 's' : '') + ': ' + ips.join(', '));
		}
		var output = 'In rooms: ';
		var first = true;
		for (var i in targetUser.roomCount) {
			if (i === 'global' || Rooms.get(i).isPrivate) continue;
			if (!first) output += ' | ';
			first = false;

			output += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
		}
		this.sendReply('|raw|'+output);
	},

	ipsearch: function(target, room, user) {
		if (!this.can('rangeban')) return;
		var atLeastOne = false;
		this.sendReply("Usuarios con IP "+target+":");
		for (var userid in Users.users) {
			var user = Users.users[userid];
			if (user.latestIp === target) {
				this.sendReply((user.connected?"+":"-")+" "+user.name);
				atLeastOne = true;
			}
		}
		if (!atLeastOne) this.sendReply("No se encontro resultados.");
	},

	/*********************************************************
	 * Shortcuts
	 *********************************************************/

	invite: function(target, room, user) {
		target = this.splitTarget(target);
		if (!this.targetUser) {
			return this.sendReply('El usuario '+this.targetUsername+' no ha sido localizado.');
		}
		var roomid = (target || room.id);
		if (!Rooms.get(roomid)) {
			return this.sendReply('Sala '+roomid+' no encontrada.');
		}
		return this.parse('/msg '+this.targetUsername+', /invite '+roomid);
	},

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	data: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var pokemon = Tools.getTemplate(target);
		var item = Tools.getItem(target);
		var move = Tools.getMove(target);
		var ability = Tools.getAbility(target);

		var data = '';
		if (pokemon.exists) {
			data += '|c|~|/data-pokemon '+pokemon.name+'\n';
		}
		if (ability.exists) {
			data += '|c|~|/data-ability '+ability.name+'\n';
		}
		if (item.exists) {
			data += '|c|~|/data-item '+item.name+'\n';
		}
		if (move.exists) {
			data += '|c|~|/data-move '+move.name+'\n';
		}
		if (!data) {
			data = "||No hay informacion para '"+target+")";
		}

		this.sendReply(data);
	},
	
	dexsearch: function (target, room, user) {
                if (!this.canBroadcast()) return;
 
                if (!target) return this.parse('/help dexsearch');
                var targets = target.split(',');
                var target;
                var moves = {}, tiers = {}, colours = {}, ability = {}, gens = {}, types = {};
                var count = 0;
                var all = false;
                var output = 10;
 
                for (var i in targets) {
                        target = Tools.getMove(targets[i]);
                        if (target.exists) {
                                if (!moves.count) {
                                        count++;
                                        moves.count = 0;
                                };
                                if (moves.count === 4) {
                                        return this.sendReply('Tope de 4 movimientos.');
                                };
                                moves[target] = 1;
                                moves.count++;
                                continue;
                        };
 
                        target = Tools.getAbility(targets[i]);
                        if (target.exists) {
                                if (!ability.count) {
                                        count++;
                                        ability.count = 0;
                                };
                                if (ability.count === 1) {
                                        return this.sendReply('Especifique solo una habilidad.');
                                };
                                ability[target] = 1;
                                ability.count++;
                                continue;
                        };
 
                        target = targets[i].trim().toLowerCase();
                        if (['fire','water','electric','dragon','rock','fighting','ground','ghost','psychic','dark','bug','flying','grass','poison','normal','steel','ice'].indexOf(toId(target.substring(0, target.length - 4))) > -1) {
                                if (!types.count) {
                                        count++;
                                        types.count = 0;
                                };
                                if (types.count === 2) {
                                        return this.sendReply('Especifique hasta dos tipos.');
                                };
                                types[toId(target.substring(0, target.length - 4)).substring(0, 1).toUpperCase() + toId(target.substring(0, target.length - 4)).substring(1)] = 1;
                                types.count++;
                        }
                        else if (['uber','ou','uu','ru','nu','lc','cap','bl','bl2','nfe','illegal'].indexOf(target) > -1) {
                                if (!tiers.count) {
                                        count++;
                                        tiers.count = 0;
                                };
                                tiers[target] = 1;
                                tiers.count++;
                        }
                        else if (['green','red','blue','white','brown','yellow','purple','pink','gray','black'].indexOf(target) > -1) {
                                if (!colours.count) {
                                        count++;
                                        colours.count = 0;
                                };
                                colours[target] = 1;
                                colours.count++;
                        }
                        else if (parseInt(target, 10) > 0) {
                                if (!gens.count) {
                                        count++;
                                        gens.count = 0;
                                };
                                gens[parseInt(target, 10)] = 1;
                                gens.count++;
                        }
                        else if (target === 'all') {
                                if (this.broadcasting) {
                                        return this.sendReply('A search with the parameter "all" cannot be broadcast.')
                                };
                                all = true;
                        }
                        else {
                                return this.sendReply('"' + target + '" could not be found in any of the search categories.');
                        };
                };
 
 		if (all && count === 0) return this.sendReply('No search parameters other than "all" were found.\nTry "/help dexsearch" for more information on this command.');
 
                while (count > 0) {
                        --count;
                        var tempResults = [];
                        if (!results) {
                                for (var pokemon in Tools.data.Pokedex) {
                                        if (pokemon === 'arceusunknown') continue;
                                        pokemon = Tools.getTemplate(pokemon);
                                        if (!(!('illegal' in tiers) && pokemon.tier === 'Illegal')) {
                                                tempResults.add(pokemon);
                                        }
                                };
                        } else {
                                for (var mon in results) tempResults.add(results[mon]);
                        };
                        var results = [];
 
                        if (types.count > 0) {
                                for (var mon in tempResults) {
                                        if (types.count === 1) {
                                                if (tempResults[mon].types[0] in types || tempResults[mon].types[1] in types) results.add(tempResults[mon]);
                                        } else {
                                                if (tempResults[mon].types[0] in types && tempResults[mon].types[1] in types) results.add(tempResults[mon]);
                                        };
                                };
                                types.count = 0;
                                continue;
                        };
       
                        if (tiers.count > 0) {
                                for (var mon in tempResults) {
                                        if ('cap' in tiers) {
                                                if (tempResults[mon].tier.substring(2).toLowerCase() === 'cap') results.add(tempResults[mon]);
                                        };
                                        if (tempResults[mon].tier.toLowerCase() in tiers) results.add(tempResults[mon]);
                                };
                                tiers.count = 0;
                                continue;
                        };
 
                        if (ability.count > 0) {
                                for (var mon in tempResults) {
                                        for (var monAbility in tempResults[mon].abilities) {
                                                if (Tools.getAbility(tempResults[mon].abilities[monAbility]) in ability) results.add(tempResults[mon]);
                                        };
                                };
                                ability.count = 0;
                                continue;
                        };
 
                        if (colours.count > 0) {
                                for (var mon in tempResults) {
                                        if (tempResults[mon].color.toLowerCase() in colours) results.add(tempResults[mon]);
                                };
                                colours.count = 0;
                                continue;
                        };
 
                        if (moves.count > 0) {
                                var problem;
                                var move = {};
                                for (var mon in tempResults) {
                                        var lsetData = {set:{}};
                                        template = Tools.getTemplate(tempResults[mon].id);
                                        for (var i in moves) {
                                                move = Tools.getMove(i);
                                                if (move.id !== 'count') {
                                                        if (!move.exists) return this.sendReply('"' + move + '" is not a known move.');
                                                        problem = Tools.checkLearnset(move, template, lsetData);
                                                        if (problem) break;
                                                };
                                        };
                                        if (!problem) results.add(tempResults[mon]);
                                };
                                moves.count = 0;
                                continue;
                        };
 
                        if (gens.count > 0) {
                                for (var mon in tempResults) {
                                        if (tempResults[mon].gen in gens) results.add(tempResults[mon]);
                                };
                                gens.count = 0;
                                continue;
                        };
                };
 
                var resultsStr = '';
                if (results.length > 0) {
                        if (all || results.length <= output) {
                                for (var i = 0; i < results.length; i++) resultsStr += results[i].species + ', ';
                        } else {
                                var hidden = string(results.length - output);
                                results.sort(function(a,b) {return Math.round(Math.random());});
                                for (var i = 0; i < output; i++) resultsStr += results[i].species + ', ';
                                resultsStr += ' and ' + hidden + ' more. Redo the search with "all" as a search parameter to show all results.  '
                        };
                } else {
                        resultsStr = 'No Pokemon found.  ';
                };
                return this.sendReplyBox(resultsStr.substring(0, resultsStr.length - 2));
        },

	learnset: 'learn',
	learnall: 'learn',
	learn5: 'learn',
	learn: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help learn');

		if (!this.canBroadcast()) return;

		var lsetData = {set:{}};
		var targets = target.split(',');
		var template = Tools.getTemplate(targets[0]);
		var move = {};
		var problem;
		var all = (cmd === 'learnall');
		if (cmd === 'learn5') lsetData.set.level = 5;

		if (!template.exists) {
			return this.sendReply('No se encontro el pokemon "'+template.id+'"');
		}

		if (targets.length < 2) {
			return this.sendReply('Especifique al menos un movimiento.');
		}

		for (var i=1, len=targets.length; i<len; i++) {
			move = Tools.getMove(targets[i]);
			if (!move.exists) {
				return this.sendReply('No se encontro el movimiento "'+move.id+'"');
			}
			problem = Tools.checkLearnset(move, template, lsetData);
			if (problem) break;
		}
		var buffer = ''+template.name+(problem?" <span class=\"message-learn-cannotlearn\">no</span> puede aprender ":" <span class=\"message-learn-canlearn\">si</span> puede aprender ")+(targets.length>2?"los movimientos":move.name);
		if (!problem) {
			var sourceNames = {E:"huevo",S:"evento",D:"dream world"};
			if (lsetData.sources || lsetData.sourcesBefore) buffer += " solo si se obtiene de:<ul class=\"message-learn-list\">";
			if (lsetData.sources) {
				var sources = lsetData.sources.sort();
				var prevSource;
				var prevSourceType;
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					if (source.substr(0,2) === prevSourceType) {
						if (prevSourceCount < 0) buffer += ": "+source.substr(2);
						else if (all || prevSourceCount < 3) buffer += ', '+source.substr(2);
						else if (prevSourceCount == 3) buffer += ', ...';
						prevSourceCount++;
						continue;
					}
					prevSourceType = source.substr(0,2);
					prevSourceCount = source.substr(2)?0:-1;
					buffer += "<li>gen "+source.substr(0,1)+" "+sourceNames[source.substr(1,1)];
					if (prevSourceType === '5E' && template.maleOnlyDreamWorld) buffer += " (no puede tener habilidad DW)";
					if (source.substr(2)) buffer += ": "+source.substr(2);
				}
			}
			if (lsetData.sourcesBefore) buffer += "<li>cualquier generacion anterior a "+(lsetData.sourcesBefore+1);
			buffer += "</ul>";
		}
		this.sendReplyBox(buffer);
	},

	weak: 'weakness',
	weakness: function(target, room, user){
		var targets = target.split(/[ ,\/]/);

		var pokemon = Tools.getTemplate(target);
		var type1 = Tools.getType(targets[0]);
		var type2 = Tools.getType(targets[1]);

		if (pokemon.exists) {
			target = pokemon.species;
		} else if (type1.exists && type2.exists) {
			pokemon = {types: [type1.id, type2.id]};
			target = type1.id + "/" + type2.id;
		} else if (type1.exists) {
			pokemon = {types: [type1.id]};
			target = type1.id;
		} else {
			return this.sendReplyBox(target + " no es un pokemon o tipo reconocido.");
		}

		var weaknesses = [];
		Object.keys(Tools.data.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				if (typeMod == 1) weaknesses.push(type);
				if (typeMod == 2) weaknesses.push("<b>" + type + "</b>");
			}
		});

		if (!weaknesses.length) {
			this.sendReplyBox(target + " no tiene debilidades.");
		} else {
			this.sendReplyBox(target + " es debil ante: " + weaknesses.join(', ') + " (sin contar habilidades).");
		}
	},
	
	matchup: 'effectiveness',
	effectiveness: function(target, room, user) {
		var targets = target.split(/[,/]/);
		var type = Tools.getType(targets[1]);
		var pokemon = Tools.getTemplate(targets[0]);
		var defender;

		if (!pokemon.exists || !type.exists) {
			// try the other way around
			pokemon = Tools.getTemplate(targets[1]);
			type = Tools.getType(targets[0]);
		}
		defender = pokemon.species+' (sin contar habilidades)';

		if (!pokemon.exists || !type.exists) {
			// try two types
			if (Tools.getType(targets[0]).exists && Tools.getType(targets[1]).exists) {
				// two types
				type = Tools.getType(targets[0]);
				defender = Tools.getType(targets[1]).id;
				pokemon = {types: [defender]};
				if (Tools.getType(targets[2]).exists) {
					defender = Tools.getType(targets[1]).id + '/' + Tools.getType(targets[2]).id;
					pokemon = {types: [Tools.getType(targets[1]).id, Tools.getType(targets[2]).id]};
				}
			} else {
				if (!targets[1]) {
					return this.sendReply("El atacante y el defensor deben separarse con una coma.");
				}
				return this.sendReply("'"+targets[0].trim()+"' y '"+targets[1].trim()+"' no es una combinacion reconocida.");
			}
		}

		if (!this.canBroadcast()) return;

		var typeMod = Tools.getEffectiveness(type.id, pokemon);
		var notImmune = Tools.getImmunity(type.id, pokemon);
		var factor = 0;
		if (notImmune) {
			factor = Math.pow(2, typeMod);
		}

		this.sendReplyBox('Los ataques '+type.id+' son '+factor+'x efectivos contra '+defender+'.');
	},

	uptime: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var uptime = process.uptime();
		var uptimeText;
		if (uptime > 24*60*60) {
			var uptimeDays = Math.floor(uptime/(24*60*60));
			uptimeText = ''+uptimeDays+' dia'+(uptimeDays == 1 ? '' : 's');
			var uptimeHours = Math.floor(uptime/(60*60)) - uptimeDays*24;
			if (uptimeHours) uptimeText += ', '+uptimeHours+' hora'+(uptimeHours == 1 ? '' : 's');
		} else {
			uptimeText = uptime.seconds().duration();
		}
		this.sendReplyBox('Tiempo operativo: <b>'+uptimeText+'</b>');
	},

	groups: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('+ <b>Voice</b> - Pueden usar comandos de tipo ! como !groups y hablar durante chat moderado<br />' +
			'% <b>Driver</b> - Ademas, pueden silenciar usuarios y buscar cuentas alternativas<br />' +
			'@ <b>Moderator</b> - Ademas, pueden desterrar usuarios<br />' +
			'&amp; <b>Leader</b> - Ademas, pueden promover moderadores y forzar empates<br />'+
			'~ <b>Administrator</b> - Pueden hacer cualquier cosa, como cambiar lo que este mensaje dice');
	},

	opensource: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Pokemon Showdown tiene codigo abierto:<br />- Lenguaje: JavaScript<br />- <a href="https://github.com/Zarel/Pokemon-Showdown/commits/master">Que hay de nuevo?</a><br />- <a href="https://github.com/Zarel/Pokemon-Showdown">Codigo fuente del servidor</a><br />- <a href="https://github.com/Zarel/Pokemon-Showdown-Client">Codigo fuente del cliente</a>');
	},

	avatars: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Puedes cambiar tu avatar en el menu Opciones (parece un engranaje) en la esquina superior derecha de Pandora.');
	},

	introduction: 'intro',
	intro: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('New to competitive pokemon?<br />' +
			'- <a href="http://www.pokemonshowdown.com/forums/viewtopic.php?f=2&t=76">Guia para principiantes en Pokemon Showdown</a><br />' +
			'- <a href="http://www.smogon.com/dp/articles/intro_comp_pokemon">Una introduccion a Pokemon Competitivo</a><br />' +
			'- <a href="http://www.smogon.com/bw/articles/bw_tiers">Que significan las siglas "OU", "UU", etc?</a><br />' +
			'- <a href="http://www.smogon.com/bw/banlist/">Cuales son las reglas para cada formato? Que es la Clausula de Dormir?</a>');
	},

	calculator: 'calc',
	calc: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Calculadora de daño de Pokemon Showdown! (Cortesia de Honko)<br />' +
			'- <a href="http://pokemonshowdown.com/damagecalc/">Calculadora</a>');
	},

	cap: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Introduccion al proyecto CAP (Create A Pokemon)<br />' +
			'- <a href="http://www.smogon.com/cap/">Sitio web del proyecto CAP y descripcion</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=48782">Cuales Pokemon han sido creados?</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3464513">Sobre el metagame aca</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3466826">Equipos CAP de entrenamiento</a>');
	},

	gennext: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('NEXT (tambien llamado Gen-NEXT) es un modo de juego que realiza algunos cambios en este:<br />' +
			'- <a href="https://github.com/Zarel/Pokemon-Showdown/blob/master/mods/gennext/README.md">LEEME: generalidades de NEXT</a><br />' +
			'Replays de ejemplo:<br />' +
			'- <a href="http://pokemonshowdown.com/replay/gennextou-37815908">roseyraid vs Zarel</a><br />' +
			'- <a href="http://pokemonshowdown.com/replay/gennextou-37900768">QwietQwilfish vs pickdenis</a>');
	},

	om: 'othermetas',
	othermetas: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/forums/206/">Informacion sobre Otros Metajuegos</a><br />';
		}
		if (target === 'all' || target === 'hackmons') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3475624/">Sin Reglas</a><br />';
		}
		if (target === 'all' || target === 'balancedhackmons' || target === 'bh') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3463764/">Sin Reglas Balanceado</a><br />';
		}
		if (target === 'all' || target === 'glitchmons') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3467120/">Glitchmons</a><br />';
		}
		if (target === 'all' || target === 'tiershift' || target === 'ts') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3479358/">Tier Shift</a><br />';
		}
		if (target === 'all' || target === 'seasonal') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/sim/seasonal">Seasonal Ladder</a><br />';
		}
		if (target === 'all' || target === 'vgc2013' || target === 'vgc') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3471161/">VGC 2013</a><br />';
		}
		if (target === 'all' || target === 'omotm' || target === 'omofthemonth' || target === 'month') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3481155/">OM del Mes</a>';
		}
		if (!matched) {
			return this.sendReply('La entrada de Otros Metajuegos "'+target+'" no fue hallada. Intente /othermetas u /om para obtener ayuda generica.');
		}
		this.sendReplyBox(buffer);
	},

	roomhelp: function(target, room, user, connection) {
		if (room.id === 'lobby') return this.sendReply('Este comando no es apto para ser usado en el lobby.');
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Moderadores de Sala (%):<br />' +
			'- /mute <em>usuario</em>: silenciar durante 10 minutos<br />' +
			'- /hourmute <em>usuario</em>: silenciar durante 1 hora<br />' +
			'- /unmute <em>uusuario</em>: levantar el silencio<br />' +
			'- /roomvoice <em>usuario</em>: nombrar un vocero de la sala<br />' +
			'- /deroomvoice <em>usuario</em>: eliminar un vocero de la sala<br />' +
			'- /announce <em>mensaje</em>: realizar un anuncio<br />' +
			'<br />' +
			'Room owners (#) can use:<br />' +
			'- /roomdesc <em>descripcion</em>: fijar la descripcion de la sala en el menu para unirse<br />' +
			'- /roommod <em>usuario</em>: nombrar un moderador de la sala<br />' +
			'- /deroommod <em>usuario</em>: eliminar un moderador de la sala<br />' +
			'- /declare <em>mensaje</em>: realizar una declaracion global<br />' +
			'- /modchat <em>nivel</em>: activar el chat moderado (para apagar: /modchat off)<br />' +
			'</div>');
	},

	restarthelp: function(target, room, user) {
		if (room.id === 'lobby' && !this.can('lockdown')) return false;
		if (!this.canBroadcast()) return;
		this.sendReplyBox('El servidor se reiniciara. Algunas cosas que tener en cuenta:<br />' +
			'- Esperamos algunos minutos antes de reiniciar, de tal manera que las batallas en curso puedan finalizar<br />' +
			'- El reinicio en si mismo demorara unos pocos segundos<br />' +
			'- El ranking de ladder y los equipos se mantendran<br />' +
			'- Estamos reiniciando para actualizar Pandora a una version mas reciente' +
			'</div>');
	},

	rule: 'rules',
	rules: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Por favor sigue las reglas:<br />' +
			'- <a href="http://www.smogon.com/es/sim/reglas">Reglas</a><br />' +
			'</div>');
	},

	faq: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq">Preguntas frecuentes (FAQ)</a><br />';
		}
		if (target === 'all' || target === 'deviation') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#deviation">Por que este usuario gano o perdio tantos puntos?</a><br />';
		}
		if (target === 'all' || target === 'doubles' || target === 'triples' || target === 'rotation') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#doubles">Puedo jugar batallas dobles/triples/rotativas aqui?</a><br />';
		}
		if (target === 'all' || target === 'randomcap') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#randomcap">Que es este fakemon y por que esta en mi batalla aleatoria?</a><br />';
		}
		if (target === 'all' || target === 'restarts') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#restarts">Por que el servidor se esta reiniciando?</a><br />';
		}
		if (target === 'all' || target === 'staff') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/staff_faq">Preguntas frecuentes sobre el Staff</a><br />';
		}
		if (!matched) {
			return this.sendReply('La entrada de FAQ "'+target+'" no fue encontrado. Intente /faq para obtener ayuda generica.');
		}
		this.sendReplyBox(buffer);
	},

	banlists: 'tiers',
	tier: 'tiers',
	tiers: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/tiers/">Smogon Tiers</a><br />';
			buffer += '- <a href="http://www.smogon.com/bw/banlist/">The banlists for each tier</a><br />';
		}
		if (target === 'all' || target === 'ubers' || target === 'uber') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/uber">Pokemon Uber</a><br />';
		}
		if (target === 'all' || target === 'overused' || target === 'ou') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/ou"> Pokemon Muy Usados</a><br />';
		}
		if (target === 'all' || target === 'underused' || target === 'uu') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/uu">Pokemon Poco Usados</a><br />';
		}
		if (target === 'all' || target === 'rarelyused' || target === 'ru') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/ru">Pokemon Raramente Usados</a><br />';
		}
		if (target === 'all' || target === 'neverused' || target === 'nu') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/nu">Pokemon Nunca Usados</a><br />';
		}
		if (target === 'all' || target === 'littlecup' || target === 'lc') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/lc">Pokemon de Minicopa</a><br />';
		}
		if (target === 'all' || target === 'doubles') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/metagames/doubles">Dobles</a><br />';
		}
		if (!matched) {
			return this.sendReply('La entrada de formatos "'+target+'" no fue hallada. Intente /tiers para obtener ayuda generica.');
		}
		this.sendReplyBox(buffer);
	},

	analysis: 'smogdex',
	strategy: 'smogdex',
	smogdex: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || "bw").trim().toLowerCase();
		var genNumber = 5;
		var doublesFormats = {'vgc2012':1,'vgc2013':1,'doubles':1};
		var doublesFormat = (!targets[2] && generation in doublesFormats)? generation : (targets[2] || '').trim().toLowerCase();
		var doublesText = '';
		if (generation === "bw" || generation === "bw2" || generation === "5" || generation === "five") {
			generation = "bw";
		} else if (generation === "dp" || generation === "dpp" || generation === "4" || generation === "four") {
			generation = "dp";
			genNumber = 4;
		} else if (generation === "adv" || generation === "rse" || generation === "rs" || generation === "3" || generation === "three") {
			generation = "rs";
			genNumber = 3;
		} else if (generation === "gsc" || generation === "gs" || generation === "2" || generation === "two") {
			generation = "gs";
			genNumber = 2;
		} else if(generation === "rby" || generation === "rb" || generation === "1" || generation === "one") {
			generation = "rb";
			genNumber = 1;
		} else {
			generation = "bw";
		}
		if (doublesFormat !== '') {
			// Smogon only has doubles formats analysis from gen 5 onwards.
			if (!(generation in {'bw':1,'xy':1}) || !(doublesFormat in doublesFormats)) {
				doublesFormat = '';
			} else {
				doublesText = {'vgc2012':'VGC 2012 ','vgc2013':'VGC 2013 ','doubles':'Doubles '}[doublesFormat];
				doublesFormat = '/' + doublesFormat;
			}
		}
		
		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox(pokemon.name+' did not exist in '+generation.toUpperCase()+'!');
			}
			if (pokemon.tier === 'G4CAP' || pokemon.tier === 'G5CAP') {
				generation = "cap";
			}
	
			var poke = pokemon.name.toLowerCase();
			if (poke === 'nidoranm') poke = 'nidoran-m';
			if (poke === 'nidoranf') poke = 'nidoran-f';
			if (poke === 'farfetch\'d') poke = 'farfetchd';
			if (poke === 'mr. mime') poke = 'mr_mime';
			if (poke === 'mime jr.') poke = 'mime_jr';
			if (poke === 'deoxys-attack' || poke === 'deoxys-defense' || poke === 'deoxys-speed' || poke === 'kyurem-black' || poke === 'kyurem-white') poke = poke.substr(0,8);
			if (poke === 'wormadam-trash') poke = 'wormadam-s';
			if (poke === 'wormadam-sandy') poke = 'wormadam-g';
			if (poke === 'rotom-wash' || poke === 'rotom-frost' || poke === 'rotom-heat') poke = poke.substr(0,7);
			if (poke === 'rotom-mow') poke = 'rotom-c';
			if (poke === 'rotom-fan') poke = 'rotom-s';
			if (poke === 'giratina-origin' || poke === 'tornadus-therian' || poke === 'landorus-therian') poke = poke.substr(0,10);
			if (poke === 'shaymin-sky') poke = 'shaymin-s';
			if (poke === 'arceus') poke = 'arceus-normal';
			if (poke === 'thundurus-therian') poke = 'thundurus-t';
	
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/pokemon/'+poke+doublesFormat+'">'+generation.toUpperCase()+' '+doublesText+pokemon.name+' analizado</a> por la <a href="http://www.smogon.com">Universidad de Smogon</a>');
		}
		
		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/items/'+itemName+'">'+generation.toUpperCase()+' '+item.name+' analizado</a> por la <a href="http://www.smogon.com">Universidad de Smogon</a>');
		}
		
		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/abilities/'+abilityName+'">'+generation.toUpperCase()+' '+ability.name+' analizado</a> por la <a href="http://www.smogon.com">Universidad de Smogon</a>');
		}
		
		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/moves/'+moveName+'">'+generation.toUpperCase()+' '+move.name+' analizado</a> por la <a href="http://www.smogon.com">Universidad de Smogon</a>');
		}
		
		if (!atLeastOne) {
			return this.sendReplyBox('Pokemon, objeto, movimiento o habilidad no encontrado para la generacion ' + generation.toUpperCase() + '.');
		}
	},

	/*********************************************************
	 * Miscellaneous commands
	 *********************************************************/

	birkal: function(target, room, user) {
		this.sendReply("Ya no es divertido.");
	},

	potd: function(target, room, user) {
		if (!this.can('potd')) return false;

		config.potd = target;
		Simulator.SimulatorProcess.eval('config.potd = \''+toId(target)+'\'');
		if (target) {
			if (Rooms.lobby) Rooms.lobby.addRaw('<div class="broadcast-blue"><b>El Pokemon de Hoy es '+target+'!</b><br />Este Pokemon aparecera en todas las batallas aleatorias.</div>');
			this.logModCommand('El Pokemon de Hoy es '+target+' gracias a '+user.name+'.');
		} else {
			if (Rooms.lobby) Rooms.lobby.addRaw('<div class="broadcast-blue"><b>El Pokemon de Hoy fue eliminado!</b><br />Ningun Pokemon esta garantizado en batallas aleatorias.</div>');
			this.logModCommand('El Pokemon de Hoy fue eliminado gracias a '+user.name+'.');
		}
	},

	register: function() {
		if (!this.canBroadcast()) return;
		this.sendReply("Debes ganar una batalla de ladder antes de registrarte.");
	},

	br: 'banredirect',
	banredirect: function() {
		this.sendReply('/banredirect - Este comando es obsoleto y fue eliminado.');
	},

	lobbychat: function(target, room, user, connection) {
		if (!Rooms.lobby) return this.popupReply("Este servidor no tiene un lobby.");
		target = toId(target);
		if (target === 'off') {
			user.leaveRoom(Rooms.lobby, connection.socket);
			connection.send('|users|');
			this.sendReply('Ahora estas bloqueando el chat del lobby.');
		} else {
			user.joinRoom(Rooms.lobby, connection);
			this.sendReply('Ahora estas participando del chat del lobby.');
		}
	},

	a: function(target, room, user) {
		if (!this.can('battlemessage')) return false;
		// secret sysop command
		room.add(target);
	},

	/*********************************************************
	 * Help commands
	 *********************************************************/

	commands: 'help',
	h: 'help',
	'?': 'help',
	help: function(target, room, user) {
		target = target.toLowerCase();
		var matched = false;
		if (target === 'all' || target === 'msg' || target === 'pm' || target === 'whisper' || target === 'w') {
			matched = true;
			this.sendReply('/msg OR /whisper OR /w [username], [message] - Send a private message.');
		}
		if (target === 'all' || target === 'r' || target === 'reply') {
			matched = true;
			this.sendReply('/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to.');
		}
		if (target === 'all' || target === 'getip' || target === 'ip') {
			matched = true;
			this.sendReply('/ip - Get your own IP address.');
			this.sendReply('/ip [username] - Get a user\'s IP address. Requires: @ & ~');
		}
		if (target === 'all' || target === 'rating' || target === 'ranking' || target === 'rank' || target === 'ladder') {
			matched = true;
			this.sendReply('/rating - Get your own rating.');
			this.sendReply('/rating [username] - Get user\'s rating.');
		}
		if (target === 'all' || target === 'nick') {
			matched = true;
			this.sendReply('/nick [new username] - Change your username.');
		}
		if (target === 'all' || target === 'avatar') {
			matched = true;
			this.sendReply('/avatar [new avatar number] - Change your trainer sprite.');
		}
		if (target === 'all' || target === 'rooms') {
			matched = true;
			this.sendReply('/rooms [username] - Show what rooms a user is in.');
		}
		if (target === 'all' || target === 'whois') {
			matched = true;
			this.sendReply('/whois [username] - Get details on a username: group, and rooms.');
		}
		if (target === 'all' || target === 'data') {
			matched = true;
			this.sendReply('/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability.');
			this.sendReply('!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~');
		}
		if (target === "all" || target === 'analysis') {
			matched = true;
			this.sendReply('/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.');
			this.sendReply('!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'groups') {
			matched = true;
			this.sendReply('/groups - Explains what the + % @ & next to people\'s names mean.');
			this.sendReply('!groups - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'opensource') {
			matched = true;
			this.sendReply('/opensource - Links to PS\'s source code repository.');
			this.sendReply('!opensource - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'avatars') {
			matched = true;
			this.sendReply('/avatars - Explains how to change avatars.');
			this.sendReply('!avatars - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'intro') {
			matched = true;
			this.sendReply('/intro - Provides an introduction to competitive pokemon.');
			this.sendReply('!intro - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'cap') {
			matched = true;
			this.sendReply('/cap - Provides an introduction to the Create-A-Pokemon project.');
			this.sendReply('!cap - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'om') {
			matched = true;
			this.sendReply('/om - Provides links to information on the Other Metagames.');
			this.sendReply('!om - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'learn' || target === 'learnset' || target === 'learnall') {
			matched = true;
			this.sendReply('/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.')
			this.sendReply('!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~')
		}
		if (target === 'all' || target === 'calc' || target === 'caclulator') {
			matched = true;
			this.sendReply('/calc - Provides a link to a damage calculator');
			this.sendReply('!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'blockchallenges' || target === 'away' || target === 'idle') {
			matched = true;
			this.sendReply('/away - Blocks challenges so no one can challenge you. Deactivate it with /back.');
		}
		if (target === 'all' || target === 'allowchallenges' || target === 'back') {
			matched = true;
			this.sendReply('/back - Unlocks challenges so you can be challenged again. Deactivate it with /away.');
		}
		if (target === 'all' || target === 'faq') {
			matched = true;
			this.sendReply('/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.');
			this.sendReply('!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'highlight') {
			matched = true;
			this.sendReply('Set up highlights:');
			this.sendReply('/highlight add, word - add a new word to the highlight list.');
			this.sendReply('/highlight list - list all words that currently highlight you.');
			this.sendReply('/highlight delete, word - delete a word from the highlight list.');
			this.sendReply('/highlight delete - clear the highlight list');
		}
		if (target === 'all' || target === 'timestamps') {
			matched = true;
			this.sendReply('Set your timestamps preference:');
			this.sendReply('/timestamps [all|lobby|pms], [minutes|seconds|off]');
			this.sendReply('all - change all timestamps preferences, lobby - change only lobby chat preferences, pms - change only PM preferences');
			this.sendReply('off - set timestamps off, minutes - show timestamps of the form [hh:mm], seconds - show timestamps of the form [hh:mm:ss]');
		}
		if (target === 'all' || target === 'effectiveness') {
			matched = true;
			this.sendReply('/effectiveness [type1], [type2] - Provides the effectiveness of a [type1] attack to a [type2] Pokémon.');
			this.sendReply('!effectiveness [type1], [type2] - Shows everyone the effectiveness of a [type1] attack to a [type2] Pokémon.');
		}
		if (target === 'all' || target === 'dexsearch') {
                        matched = true;
                        this.sendReply('Searches for Pokemon that fulfill the selected criteria.');
                        this.sendReply('Search categories are: type, tier, color, moves, ability, gen.');
                        this.sendReply('Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.');
                        this.sendReply('Valid tiers are: Uber/OU/BL/UU/BL2/RU/NU/NFE/LC/CAP/Illegal.');
                        this.sendReply('Types must be followed by " type", e.g., "dragon type".');
                        this.sendReply('/dexsearch [type], [move], [move],...');
                        this.sendReply('The order of the parameters does not matter.');
                }
		if (target === '%' || target === 'modnote') {
			matched = true;
			this.sendReply('/modnote [note] - Adds a moderator note that can be read through modlog. Requires: % @ & ~');
		}
		if (target === '%' || target === 'altcheck' || target === 'alt' || target === 'alts' || target === 'getalts') {
			matched = true;
			this.sendReply('/alts OR /altcheck OR /alt OR /getalts [username] - Get a user\'s alts. Requires: % @ & ~');
		}
		if (target === '%' || target === 'forcerename' || target === 'fr') {
			matched = true;
			this.sendReply('/forcerename OR /fr [username], [reason] - Forcibly change a user\'s name and shows them the [reason]. Requires: % @ & ~');
		}
		if (target === '%' || target === 'redir' || target === 'redirect') {
			matched = true;
			this.sendReply('/redirect OR /redir [username], [room] - Forcibly move a user from the current room to [room]. Requires: % @ & ~');
		}
		if (target === '@' || target === 'ban' || target === 'b') {
			matched = true;
			this.sendReply('/ban OR /b [username], [reason] - Kick user from all rooms and ban user\'s IP address with reason. Requires: @ & ~');
		}
		if (target === '@' || target === 'unban') {
			matched = true;
			this.sendReply('/unban [username] - Unban a user. Requires: @ & ~');
		}
		if (target === '@' || target === 'unbanall') {
			matched = true;
			this.sendReply('/unbanall - Unban all IP addresses. Requires: @ & ~');
		}
		if (target === '%' || target === 'modlog') {
			matched = true;
			this.sendReply('/modlog [n] - If n is a number or omitted, display the last n lines of the moderator log. Defaults to 15. If n is not a number, search the moderator log for "n". Requires: % @ & ~');
		}
		if (target === "%" || target === 'kickbattle ') {
			matched = true;
			this.sendReply('/kickbattle [username], [reason] - Kicks an user from a battle with reason. Requires: % @ & ~');
		}
		if (target === "%" || target === 'warn' || target === 'k') {
			matched = true;
			this.sendReply('/warn OR /k [username], [reason] - Warns a user showing them the Pokemon Showdown Rules and [reason] in an overlay. Requires: % @ & ~');
		}
		if (target === '%' || target === 'mute' || target === 'm') {
			matched = true;
			this.sendReply('/mute OR /m [username], [reason] - Mute user with reason for 7 minutes. Requires: % @ & ~');
		}
		if (target === '%' || target === 'hourmute') {
			matched = true;
			this.sendReply('/hourmute , [reason] - Mute user with reason for an hour. Requires: % @ & ~');
		}	
		if (target === '%' || target === 'unmute') {
			matched = true;
			this.sendReply('/unmute [username] - Remove mute from user. Requires: % @ & ~');
		}
		if (target === '&' || target === 'promote') {
			matched = true;
			this.sendReply('/promote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: & ~');
		}
		if (target === '&' || target === 'demote') {
			matched = true;
			this.sendReply('/demote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: & ~');
		}
		if (target === '~' || target === 'forcerenameto' || target === 'frt') {
			matched = true;
			this.sendReply('/forcerenameto OR /frt [username] - Force a user to choose a new name. Requires: & ~');
			this.sendReply('/forcerenameto OR /frt [username], [new name] - Forcibly change a user\'s name to [new name]. Requires: & ~');
		}
		if (target === '&' || target === 'forcetie') {
			matched = true;
			this.sendReply('/forcetie - Forces the current match to tie. Requires: & ~');
		}
		if (target === '&' || target === 'declare' ) {
			matched = true;
			this.sendReply('/declare [message] - Anonymously announces a message. Requires: & ~');
		}
		if (target === '&' || target === 'potd' ) {
			matched = true;
			this.sendReply('/potd [pokemon] - Sets the Random Battle Pokemon of the Day. Requires: & ~');
		}
		if (target === '%' || target === 'announce' || target === 'wall' ) {
			matched = true;
			this.sendReply('/announce OR /wall [message] - Makes an announcement. Requires: % @ & ~');
		}
		if (target === '@' || target === 'modchat') {
			matched = true;
			this.sendReply('/modchat [off/registered/+/%/@/&/~] - Set the level of moderated chat. Requires: @ & ~');
		}
		if (target === '~' || target === 'hotpatch') {
			matched = true;
			this.sendReply('Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~');
			this.sendReply('Hot-patching has greater memory requirements than restarting.');
			this.sendReply('/hotpatch chat - reload chat-commands.js');
			this.sendReply('/hotpatch battles - spawn new simulator processes');
			this.sendReply('/hotpatch formats - reload the tools.js tree, rebuild and rebroad the formats list, and also spawn new simulator processes');
		}
		if (target === '~' || target === 'lockdown') {
			matched = true;
			this.sendReply('/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~');
		}
		if (target === '~' || target === 'kill') {
			matched = true;
			this.sendReply('/kill - kills the server. Can\'t be done unless the server is in lockdown state. Requires: ~');
		}
		if (target === 'all' || target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			matched = true;
			this.sendReply('/help o /h o /? - Brinda ayuda.');
		}
		if (!target) {
			this.sendReply('COMANDOS: /msg, /reply, /ip, /rating, /nick, /avatar, /rooms, /whois, /help, /away, /back, /timestamps');
			this.sendReply('INFORMACION: /data, /groups, /opensource, /avatars, /faq, /rules, /intro, /tiers, /othermetas, /learn, /analysis, /calc (reemplazar / por ! para vocear. (Requiere: + % @ & ~))');
			this.sendReply('Para obtener detalles sobre todos los comandos, utilice /help all');
			if (user.group !== config.groupsranking[0]) {
				this.sendReply('CONDUCTOR: /mute, /unmute, /announce, /forcerename, /alts')
				this.sendReply('MODERADOR: /ban, /unban, /unbanall, /ip, /modlog, /redirect, /kick');
				this.sendReply('LIDER: /promote, /demote, /forcewin, /forcetie, /declare');
				this.sendReply('Para obtener detalles sobre los comandos de moderacion, utilice /help @');
			}
			this.sendReply('Para obtener detalles sobre un comando especifico, utilice un comando como: /help data');
		} else if (!matched) {
			this.sendReply('El comando "/'+target+'" no fue encontrado. Intente /help para obtener ayuda generica');
		}
	},

};