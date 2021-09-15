/** WebSocketSyncServer.
 WebSocket server that can be used as a template for how to implement a sync server that interchange changes
 between a Dexie.Syncable client and a database of any kind.
 The code is only dependant on nodejs-websocket. For simplicity reasons, it uses a non-persistent RAM database. It handles conflicts according to
 the Dexie.Syncable specification; The rules of thumb for conflict handling is that:
 1. Client- and server state must be exact the same after a sync operation.
 2. Server changes are applied after client changes - thereby winning over the latter except when client
 already has deleted an object - then the server update wont affect any object since it doesnt exist
 on client.
 In this code, the resolveConflicts() function handles changes on the server AS IF the server changes where
 applied after client changes.
 */

 const webSocket = require("nodejs-websocket"); // This will work also in browser if "websocketserver-shim.js" is included.
 const connectToDatabase = require("../utils/mongo-db");
 const chalk = require('chalk');
 
 // CREATE / UPDATE / DELETE constants:
 const CREATE = 1,
     UPDATE = 2,
     DELETE = 3;
 
 class SyncServer {
     port;
     db;
     revision = 0;
     dbHandler = {
        // tables: {},  // Tables: Each key is a table and its value is another object where each key is the primary key and value is the record / object that is stored in ram.
        // changes: [], // Special table that records all changes made to the db. In this simple sample, we let it grow infinitly. In real world, we would have had a regular cleanup of old changes.
        // uncommittedChanges: {}, // Map<clientID,Array<change>> Changes where partial=true buffered for being committed later on.
        // Current revision of the database.
        subscribers: [], // Subscribers to when database got changes. Used by server connections to be able to push out changes to their clients as they occur.
        trigger: () => {
            if (!this.dbHandler.trigger.delayedHandle) {
                // Delay the trigger so that it's only called once per bunch of changes instead of being called for each single change.
                this.dbHandler.trigger.delayedHandle = setTimeout(() => {
                    delete this.dbHandler.trigger.delayedHandle;
                    this.dbHandler.subscribers.forEach((subscriber) => {
                        try { subscriber(); } catch (e) { }
                    });
                }, 0);
            }
        },
        subscribe: (fn) => {
            this.dbHandler.subscribers.push(fn);
        },
        unsubscribe: (fn) => {
            this.dbHandler.subscribers.splice(this.dbHandler.subscribers.indexOf(fn), 1);
        },
        create: async (table, key, obj, clientIdentity) => {
            try {
                // Create table if it doesnt exist:
                //this.dbHandler.tables[table] = this.dbHandler.tables[table] || {};
                // Put the obj into to table
                // this.dbHandler.tables[table][key] = obj;
                await this.db.collection(table).insertOne({_id: key, ...obj});
                // Register the change:
                this.revision = this.revision + 1;

                 this.db.collection('changes').insertOne({
                    rev: this.revision,
                    source: clientIdentity,
                    type: CREATE,
                    table: table,
                    key: key,
                    obj: obj
                }).catch(err => console.log(err));
                //  this.dbHandler.changes.push({
                //      rev: ++this.revision,
                //      source: clientIdentity,
                //      type: CREATE,
                //      table: table,
                //      key: key,
                //      obj: obj
                //  });
                 this.dbHandler.trigger();

            } catch(err) {
                console.log(err)
            }
        },
        update: async (table, key, modifications, clientIdentity) => {
            try {
                await this.db.collection(table).updateOne({_id: key}, {$set: {...modifications}}, {$upsert: true})
                // Register the change:
                this.revision = this.revision + 1;

                this.db.collection('changes').insertOne({
                    rev: this.revision,
                    source: clientIdentity,
                    type: UPDATE,
                    table: table,
                    key: key,
                    mods: modifications
                }).catch(err => console.log(err));

                this.dbHandler.trigger();
            } catch(err) {
                console.log(err)
            }
        },
        'delete': async (table, key, clientIdentity) => {
            try {
                await this.db.collection(table).deleteOne({_id: key})
                
                this.revision = this.revision + 1;

                this.db.collection('changes').insertOne({
                    rev: this.revision,
                    source: clientIdentity,
                    type: DELETE,
                    table: table,
                    key: key,
                }).catch(err => console.log(err));

                this.dbHandler.trigger();

            } catch(err) {
                console.log(err)
            }

            // if (this.dbHandler.tables[table]) {
            //     if (this.dbHandler.tables[table][key]) {
            //         delete this.dbHandler.tables[table][key];
            //         this.dbHandler.changes.push({
            //             rev: this.revision,
            //             source: clientIdentity,
            //             type: DELETE,
            //             table: table,
            //             key: key,
            //         });
            //         this.dbHandler.trigger();
            //     }
            // }
        }
    };

     constructor(port) {
         this.port = port;
         // this.init();
     }

     async init() {
         const {db} = await connectToDatabase();
         console.log(chalk.green('[SOCKET]: Connected to database'));
         this.db = db;
         // get revision number
         const sync_config = await db.collection('sync_config').findOne({$where: function() {
            return this._id === 'SYNC_CONFIG'
        }});
        this.revision = sync_config ? sync_config.revision : 0;
     }
     // ----------------------------------------------------------------------------
     //
     //
     //
     //                               THE SERVER
     //
     //
     //
     // ----------------------------------------------------------------------------
 
     nextClientIdentity = 1;
 
     async start () {

         webSocket.createServer((conn) => {
             console.log(`Socket server running at ${this.port}...`);
             let syncedRevision = 0; // Used when sending changes to client. Only send changes above syncedRevision since client is already in sync with syncedRevision.
 
             const sendAnyChanges = () => {
                 // Get all changes after syncedRevision that was not performed by the client we're talkin' to.
                 // const changes = this.dbHandler.changes.filter(function (change) { return change.rev > syncedRevision && change.source !== conn.clientIdentity; });
                 this.db.collection('changes')
                 .find({rev: {$gt: syncedRevision}, source: {$ne: conn.clientIdentity}})
                 .toArray()
                 .then(changes => {
                    // Compact changes so that multiple changes on same object is merged into a single change.
                    const reducedSet = reduceChanges(changes, conn.clientIdentity);
                    // Convert the reduced set into an array again.
                    const reducedArray = Object.keys(reducedSet).map(function (key) { return reducedSet[key]; });
                    // Notice the current revision of the database. We want to send it to client so it knows what to ask for next time.
                    const currentRevision = this.revision;
 
                    conn.sendText(JSON.stringify({
                        type: "changes",
                        changes: reducedArray,
                        currentRevision: currentRevision,
                        partial: false // Tell client that these are the only changes we are aware of. Since our mem DB is syncronous, we got all changes in one chunk.
                    }));
 
                    syncedRevision = currentRevision; // Make sure we only send revisions coming after this revision next time and not resend the above changes over and over.
             
                 }).catch(err => {
                    console.log('L194');
                    console.error(err);
                 });
            }
 
             conn.on("text", async (message) => {
                 const request = JSON.parse(message);
                 console.log(request);
                 const type = request.type;
                 if (type === "clientIdentity") {
                     // Client Hello: Client says "Hello, My name is <clientIdentity>!" or "Hello, I'm newborn. Please give me a name!"
                     // Client identity is used for the following purpose:
                     //  * When client sends its changes, register the changes into server database and mark each change with the clientIdentity.
                     //  * When sending back changes to client, leave out those marked with the client id so that changes aren't echoed back.
                     // The client should initiate the connection by submitting or requesting a client identity.
                     // This should be done before sending any changes to us.
 
                     // Client submits his identity or requests one
                     if (request.clientIdentity) {
                         // Client has an identity that we have given earlier
                         conn.clientIdentity = request.clientIdentity;
                     } else {
                         // Client requests an identity. Provide one.
                         // conn.clientIdentity = nextClientIdentity++;
                         this.db.collection('client_ids').insertOne({...request.systemInfo})
                         .then(({insertedId}) => {
                            conn.clientIdentity = insertedId;

                            conn.sendText(JSON.stringify({
                                type: "clientIdentity",
                                clientIdentity: conn.clientIdentity
                            }));
                         })
                         .catch(err => {
                            console.log('229');
                            console.error(err);
                         });
                         
                     }
                 } else if (type === "subscribe") {
                     // Client wants to subscribe to server changes happened or happening after given syncedRevision
                     syncedRevision = request.syncedRevision || 0;
                     // Send any changes we have currently:
                     sendAnyChanges();
                     // Start subscribing for additional changes:
                     this.dbHandler.subscribe(sendAnyChanges);
 
                 } else if (type === "changes") {
                     // Client sends its changes to us.
                     const requestId = request.requestId;
                     try {
                         if (!request.changes instanceof Array) {
                             throw "Property 'changes' must be provided and must be an array";
                         }
                         if (!("baseRevision" in request)) {
                             throw "Property 'baseRevision' missing";
                         }
                         // First, if sent change set is partial.
                         if (request.partial) {
                             // Don't commit changes just yet. Store it in the partialChanges table so far. (In real db, uncommittedChanges would be its own table with columns: {clientID, type, table, key, obj, mods}).
                             // Get or create db.uncommittedChanges array for current client
                             const _changes = request.changes.map(change => ({clientID: conn.clientIdentity, ...change}));
                             await this.db.collection('uncommited_changes').insertOne(_changes)
                             .catch(err => {
                                console.log('L194');
                                console.error(err);
                             });
                            //  if (this.dbHandler.uncommittedChanges[conn.clientIdentity]) {
                            //      // Concat the changes to existing change set:
                            //      this.dbHandler.uncommittedChanges[conn.clientIdentity] = this.dbHandler.uncommittedChanges[conn.clientIdentity].concat(request.changes);
                            //      //
                            //      this.db.collection('uncommited_changes').updateOne(clientUncommitedChanges._id, {
                            //          $set: 
                            //      })
                            //  } else {
                            //      // Create the change set:
                            //      this.dbHandler.uncommittedChanges[conn.clientIdentity] = request.changes;
                            //  }
                         } else {
                             // This request is not partial. Time to commit.
                             // But first, check if we have previous changes from that client in uncommittedChanges because now is the time to commit them too.
                             const clientUncommitedChanges = await this.db.collection('uncommited_changes').find({
                                $where: function () {
                                    this.clientID === conn.clientIdentity
                                }
                            }).toArray();

                            if(clientUncommitedChanges.length > 0) {
                                request.changes = clientUncommitedChanges.concat(request.changes);
                                const clientUncommitedChanges = await this.db.collection('uncommited_changes').deleteMany({
                                    $where: function () {
                                        this.clientID === conn.clientIdentity
                                    }
                                });
                            }
                            //  if (this.dbHandler.uncommittedChanges[conn.clientIdentity]) {
                            //      request.changes = this.dbHandler.uncommittedChanges[conn.clientIdentity].concat(request.changes);
                            //      delete this.dbHandler.uncommittedChanges[conn.clientIdentity];
                            //  }
 
                             // ----------------------------------------------
                             //
                             //
                             //
                             // HERE COMES THE QUITE IMPORTANT SYNC ALGORITHM!
                             //
                             // 1. Reduce all server changes (not client changes) that have occurred after given
                             //    baseRevision (our changes) to a set (key/value object where key is the combination of table/primaryKey)
                             // 2. Check all client changes against reduced server
                             //    changes to detect conflict. Resolve conflicts:
                             //      If server created an object with same key as client creates, updates or deletes: Always discard client change.
                             //      If server deleted an object with same key as client creates, updates or deletes: Always discard client change.
                             //      If server updated an object with same key as client updates: Apply all properties the client updates unless they conflict with server updates
                             //      If server updated an object with same key as client creates: Apply the client create but apply the server update on top
                             //      If server updated an object with same key as client deletes: Let client win. Deletes always wins over Updates.
                             //
                             // 3. After resolving conflicts, apply client changes into server database.
                             // 4. Send an ack to the client that we have persisted its changes
                             //
                             //
                             // ----------------------------------------------
                             const baseRevision = request.baseRevision || 0;
                             // const serverChanges = this.dbHandler.changes.filter(function (change) { return change.rev > baseRevision });
                             const serverChanges = await this.db.collection('changes')
                             .find({rev: { $gt: baseRevision }})
                            .toArray();
                            
                            console.log('L332', serverChanges);
                             const reducedServerChangeSet = reduceChanges(serverChanges);
                             // console.log('L334', reducedServerChangeSet)
                             const resolved = resolveConflicts(request.changes, reducedServerChangeSet);
 
                             try {
                                 // Now apply the resolved changes:
                                 console.log('L339', resolved);
                                for (const change of resolved) {
                                    switch (change.type) {
                                        case CREATE:
                                            await this.dbHandler.create(change.table, change.key, change.obj, conn.clientIdentity);
                                            break;
                                        case UPDATE:
                                            await this.dbHandler.update(change.table, change.key, change.mods, conn.clientIdentity);
                                            break;
                                        case DELETE:
                                            await this.dbHandler.delete(change.table, change.key, conn.clientIdentity);
                                            break;
                                    }
                                }
                                console.log(this.revision, 'before config update')
                                // update revision number
                                await this.db.collection('sync_config').updateOne({_id: 'SYNC_CONFIG'}, {$set: {revision: this.revision}}, {upsert: true});
                             } catch (e) {
                                 console.log('L345');
                                 console.log(e);
                             }
                         }
 
                         // Now ack client that we have recieved his changes. This should be done no matter if the're buffered into uncommittedChanges
                         // or if the're actually committed to db.
                         conn.sendText(JSON.stringify({
                             type: "ack",
                             requestId: requestId,
                         }));
                     } catch (e) {
                         console.error(e);
                         conn.sendText(JSON.stringify({
                             type: "error",
                             requestId: requestId,
                             message: e.toString()
                         }));
                         conn.close();
                     }
                 }
 
             });
 
             conn.on("close", () => {
                 // When client disconnects, stop subscribing from db.
                 this.dbHandler.unsubscribe(sendAnyChanges);
             });

             conn.on("error", (err) => {
                console.log(err.stack);
              });
         }).listen(this.port);
     }
 }
 
 function reduceChanges(changes) {
     // Converts an Array of change objects to a set of change objects based on its unique combination of (table ":" key).
     // If several changes were applied to the same object, the resulting set will only contain one change for that object.
     return changes.reduce(function (set, nextChange) {
         const id = nextChange.table + ":" + nextChange.key;
         const prevChange = set[id];
         if (!prevChange) {
             // This is the first change on this key. Add it unless it comes from the source that we are working against
             set[id] = nextChange;
         } else {
             // Merge the oldchange with the new change
             set[id] = (function () {
                 switch (prevChange.type) {
                     case CREATE:
                         switch (nextChange.type) {
                             case CREATE: return nextChange; // Another CREATE replaces previous CREATE.
                             case UPDATE: return combineCreateAndUpdate(prevChange, nextChange); // Apply nextChange.mods into prevChange.obj
                             case DELETE: return nextChange;  // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
                         }
                         break;
                     case UPDATE:
                         switch (nextChange.type) {
                             case CREATE: return nextChange; // Another CREATE replaces previous update.
                             case UPDATE: return combineUpdateAndUpdate(prevChange, nextChange); // Add the additional modifications to existing modification set.
                             case DELETE: return nextChange;  // Only send the delete change. What was updated earlier is no longer of interest.
                         }
                         break;
                     case DELETE:
                         switch (nextChange.type) {
                             case CREATE: return nextChange; // A resurection occurred. Only create change is of interest.
                             case UPDATE: return prevChange; // Nothing to do. We cannot update an object that doesnt exist. Leave the delete change there.
                             case DELETE: return prevChange; // Still a delete change. Leave as is.
                         }
                         break;
                 }
             })();
         }
         return set;
     }, {});
 }
 
 function resolveConflicts(clientChanges, serverChangeSet) {
     const resolved = [];
     clientChanges.forEach(function (clientChange) {
         const id = clientChange.table + ":" + clientChange.key;
         const serverChange = serverChangeSet[id];
         if (!serverChange) {
             // No server change on same object. Totally conflict free!
             resolved.push(clientChange);
         } else if (serverChange.type == UPDATE) {
             // Server change overlaps. Only if server change is not CREATE or DELETE, we should consider merging in the client change.
             switch (clientChange.type) {
                 case CREATE:
                     // Server has updated an object with same key as client has recreated. Let the client recreation go through, but also apply server modifications.
                     applyModifications(clientChange.obj, serverChange.mods); // No need to clone clientChange.obj beofre applying modifications since noone else refers to clientChanges (it was retrieved from the socket connection in current request)
                     resolved.push(clientChange);
                     break;
                 case UPDATE:
                     // Server and client has updated the same obejct. Just remove any overlapping keyPaths and only apply non-conflicting parts.
                     Object.keys(serverChange.mods).forEach(function (keyPath) {
                         // Remote this property from the client change
                         delete clientChange.mods[keyPath];
                         // Also, remote all changes to nestled objects under this keyPath from the client change:
                         Object.keys(clientChange.mods).forEach(function (clientKeyPath) {
                             if (clientKeyPath.indexOf(keyPath + '.') == 0) {
                                 delete clientChange.mods[clientKeyPath];
                             }
                         });
                     });
                     // Did we delete all keyPaths in the modification set of the clientChange?
                     if (Object.keys(clientChange.mods).length > 0) {
                         // No, there were some still there. Let this wing-clipped change be applied:
                         resolved.push(clientChange);
                     }
                     break;
                 case DELETE:
                     // Delete always win over update. Even client over a server
                     resolved.push(clientChange);
                     break;
             }
         } // else if serverChange.type is CREATE or DELETE, dont push anything to resolved, because the client change is not of any interest (CREATE or DELETE would eliminate any client change with same key!)
     });
     return resolved;
 }
 
 function deepClone(obj) {
     return JSON.parse(JSON.stringify(obj));
 }
 
 function applyModifications(obj, modifications) {
     Object.keys(modifications).forEach(function (keyPath) {
         setByKeyPath(obj, keyPath, modifications[keyPath]);
     });
     return obj;
 }
 
 function combineCreateAndUpdate(prevChange, nextChange) {
     const clonedChange = deepClone(prevChange);// Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
     applyModifications(clonedChange.obj, nextChange.mods); // Apply modifications to existing object.
     return clonedChange;
 }
 
 function combineUpdateAndUpdate(prevChange, nextChange) {
     const clonedChange = deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
     Object.keys(nextChange.mods).forEach(function (keyPath) {
         // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
         let hadParentPath = false;
         Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0 }).forEach(function (parentPath) {
             setByKeyPath(clonedChange.mods[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
             hadParentPath = true;
         });
         if (!hadParentPath) {
             // Add or replace this keyPath and its new value
             clonedChange.mods[keyPath] = nextChange.mods[keyPath];
         }
         // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
         // we must mimic what would happen if applying the two changes after each other:
         Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0 }).forEach(function (subPath) {
             delete clonedChange.mods[subPath];
         });
     });
     return clonedChange;
 }
 
 function setByKeyPath(obj, keyPath, value) {
     if (!obj || typeof keyPath !== 'string') return;
     const period = keyPath.indexOf('.');
     if (period !== -1) {
         const currentKeyPath = keyPath.substr(0, period);
         const remainingKeyPath = keyPath.substr(period + 1);
         if (remainingKeyPath === "")
             obj[currentKeyPath] = value;
         else {
             let innerObj = obj[currentKeyPath];
             if (!innerObj) innerObj = (obj[currentKeyPath] = {});
             setByKeyPath(innerObj, remainingKeyPath, value);
         }
     } else {
         obj[keyPath] = value;
     }
 }
 
 
 module.exports = SyncServer;
 