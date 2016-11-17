if (BABYLON.Engine.isSupported()) {
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    globalScene = null;
    playerNo = null;
    currentRoom = 0;
    ready = 0;
    gameOn = 0;
    player = [];
    turn = 0;
    inRoom = 0;
    locked = {
        "left":0,
        "up":0,
        "right":0,
        "down":0
    };
    player[1]={
        "wall":[]
    };
    player[2]={
        "wall":[]
    };
    movedPlayer = 0;
    movedWall = 0;
    wallRotated = 0;
    lock = 0;
    getUsername();

    function disposeWalls(){
        if(gameOn) {
            for (var i = 1; i < 11; i++) {
                player[1].wall[i].dispose();
                player[2].wall[i].dispose();
            }
        }
    }

    BABYLON.SceneLoader.Load("assets/", "board.babylon", engine, function (scene) {

        globalScene = scene;

        setSkyBox();

        BABYLON.SceneLoader.ImportMesh("", "../assets/", "peon.babylon", scene, function (newMeshes) {
            newMeshes[0].position.x = 15;
            newMeshes[0].scaling = {
                x:0.55,
                y:0.55,
                z:0.55
            };
            peon1 = newMeshes[0];
            peon1.material.diffuseColor = new BABYLON.Color3(153/255,102/255,51/255);
            BABYLON.SceneLoader.ImportMesh("", "../assets/", "peon.babylon", scene, function (newerMeshes) {
                newerMeshes[0].position.x = -15;
                newerMeshes[0].scaling = {
                    x:0.55,
                    y:0.55,
                    z:0.55
                };
                peon2 = newerMeshes[0];
                peon2.material = peon1.material.clone('lambert2');
                peon2.material.diffuseColor = new BABYLON.Color3(1,1,1);
            });
        });

        scene.executeWhenReady(function () {
            var light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(-2, 5, -3), scene);

            camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
            camera.setPosition(new BABYLON.Vector3(0, 15, -50));

            scene.activeCamera = camera;
            scene.activeCamera.attachControl(canvas);
            adjustCamKeys();

            // Once the scene is loaded, just register a render loop to render it
            engine.runRenderLoop(function () {
                scene.render();
            });

            fixUI();

            socket = io.connect(connectionIp);

            updateInt = setInterval(updateRooms,500);

            socket.on('connect_error',function(){
                $('#roomlist').html("<div id='connectionerror' class='alert alert-danger' role='alert'> <span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span> <span class='sr-only'>Error:</span> <strong>Error</strong><br>Problem connecting to:<br><b>"+connectionIp+"</b></div>");

            });

            socket.on('update rooms',function(room) {
                $('#roomlist').html(
                    '<div class="panel panel-default" style="opacity:0.7;cursor:pointer">' +
                    '<div class="panel-heading">Select Room...</div>' +
                    '<ul class="list-group">' +
                    '<a onclick="joinRoom(1);" class="list-group-item">Room 1 <span class="badge">' + room[1].playerCount + '/ 2</span></a>' +
                    '<a onclick="joinRoom(2);" class="list-group-item">Room 2 <span class="badge">' + room[2].playerCount + '/ 2</span></a>' +
                    '<a onclick="joinRoom(3);" class="list-group-item">Room 3 <span class="badge">' + room[3].playerCount + '/ 2</span></a>' +
                    '<a onclick="joinRoom(4);" class="list-group-item">Room 4 <span class="badge">' + room[4].playerCount + '/ 2</span></a>' +
                    '<a onclick="joinRoom(5);" class="list-group-item">Room 5 <span class="badge">' + room[5].playerCount + '/ 2</span></a>' +
                    '</ul></div>'
                );
            });

            socket.on('join room',function(room){
                clearInterval(updateInt);
                alert('Joined room '+room.id);
                currentRoom = room.id;
                playerNo = room.playerNo;
                $('#roomlist').html('<div class="btn-group"><button type="button" class="btn btn-default dropdown-toggle" style="opacity:0.7" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Room '+room.id+'<span class="caret"></span></button>'+
                    '<ul class="dropdown-menu" style="cursor:pointer">'+
                    '<li><a onclick="leaveRoom(currentRoom,playerNo);">Leave Room</a></li>'+
                    '</ul>'+
                    '</div>');
                socket.emit('update player list',currentRoom);
                setTimeout(setRoomUI,250);
            });

            socket.on('update player list',function(roomData){
                if(currentRoom == roomData.id){
                    $('#p1head').text('Player 1 : ' + roomData.player1.name);
                    if(!roomData.player1.empty) {
                        if (roomData.player1.ready) {
                            $('#p1body').text('Ready');
                            if(playerNo == 1){
                                $('#p1body').append('<a id="ready" class="btn btn-default" style="position:relative; left:20px"> Not Ready </a>');
                            }
                        } else {
                            $('#p1body').text('Not Ready');
                            if(playerNo == 1){
                                $('#p1body').append('<a id="ready" class="btn btn-default" style="position:relative; left:20px"> Ready </a>');
                            }
                        }
                    }else{
                        $('#p1body').text('No Player...');
                    }
                    $('#p2head').text('Player 2 : ' + roomData.player2.name);
                    if(!roomData.player2.empty) {
                        if (roomData.player2.ready) {
                            $('#p2body').text('Ready');
                            if(playerNo == 2){
                                $('#p2body').append('<a id="ready" class="btn btn-default" style="position:relative; left:20px"> Not Ready </a>');
                            }
                        } else {
                            $('#p2body').text('Not Ready');
                            if(playerNo == 2){
                                $('#p2body').append('<a id="ready" class="btn btn-default" style="position:relative; left:20px"> Ready </a>');
                            }
                        }
                    }else{
                        $('#p2body').text('No Player...');
                    }

                    $('#ready').click(function() {
                        if(!gameOn) {
                            var data = {
                                "id": currentRoom,
                                "playerNo": playerNo
                            };
                            socket.emit('ready', data);
                            if (!ready) {
                                ready = 1;
                            } else {
                                ready = 0;
                            }
                        }
                    });
                }
            });

            socket.on('start game',function(room){
               if(currentRoom == room){
                   //debugger;
                   gameOn = 1;
                   window.addEventListener("keydown",move, true);
                   $('#ready').attr('disabled', true);
                   for(var i=1;i<11;i++){
                       player[1].wall[i] = new BABYLON.Mesh.CreateBox("wall", 1, globalScene);
                       player[1].wall[i].scaling.x = 5;
                       player[1].wall[i].position.x = 16.5;
                       player[1].wall[i].scaling.y = 3;
                       player[1].wall[i].position.y = .5;
                       player[1].wall[i].position.z = i*3-16.5
                   }
                   for(var i=1;i<11;i++){
                       player[2].wall[i] = new BABYLON.Mesh.CreateBox("wall", 1, globalScene);
                       player[2].wall[i].scaling.x = 5;
                       player[2].wall[i].position.x = -16.5;
                       player[2].wall[i].scaling.y = 3;
                       player[2].wall[i].position.y = .5;
                       player[2].wall[i].position.z = i*3-16.5
                   }
                   if(playerNo == 1){
                       $('#p1body').append('<a id="end" class="btn btn-default" style="position:relative; left:40px; opacity: 1;"> End Turn </a>');
                       var cameraAngleAnimation = new BABYLON.Animation("", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                       var angleKeys = [];
                       angleKeys.push({
                           frame: 0,
                           value: camera.alpha
                       });
                       angleKeys.push({
                           frame: 30,
                           value: 0
                       });
                       cameraAngleAnimation.setKeys(angleKeys);
                       camera.animations.push(cameraAngleAnimation);

                       globalScene.beginAnimation(camera, 0, 30, false);
                   }else{
                       $('#p2body').append('<a id="end" class="btn btn-default" style="position:relative; left:40px; opacity: 1;"> End Turn </a>');
                       var cameraAngleAnimation = new BABYLON.Animation("", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                       var angleKeys = [];
                       angleKeys.push({
                           frame: 0,
                           value: camera.alpha
                       });
                       angleKeys.push({
                           frame: 30,
                           value: Math.PI
                       });
                       cameraAngleAnimation.setKeys(angleKeys);
                       camera.animations.push(cameraAngleAnimation);

                       globalScene.beginAnimation(camera, 0, 30, false);
                   }
                   alert('Both player are ready, game started');
                   collisionInt = setInterval(checkCollisions,33);
               }
            });

            socket.on('change turn',function(data){
                if(playerNo == 1) {
                    player1TempX = peon1.position.x;
                    player1TempZ = peon1.position.z;
                }else {
                    player2TempZ = peon2.position.z;
                    player2TempX = peon2.position.x;
                }
                if(data.player1.walls > 0){
                    player1WallZ = player[1].wall[data.player1.walls].position.z;
                    player1WallX = player[1].wall[data.player1.walls].position.x;
                }
                if(data.player2.walls > 0){
                    player2WallZ = player[2].wall[data.player2.walls].position.z;
                    player2WallX = player[2].wall[data.player2.walls].position.x;
                }

                turn = data.turn;
                wallRotated = 0;
                if(data.turn == playerNo){
                    $('#end').attr('disabled', false);
                    $('#end').attr('onclick','endTurn();');
                    if(turn==1){
                        currentWall = data.player1.walls;
                    }else{
                        currentWall = data.player2.walls;
                    }
                }else{
                    $('#end').attr('disabled', true);
                    $('#end').attr('onclick','')
                }
            });

            socket.on('move other',function(data){
                if(data.player.moved) {
                    if (data.player.id == 2) {
                        var posAnimation = new BABYLON.Animation("", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var positionKeys = [];
                        positionKeys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z)
                        });
                        positionKeys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(data.player.x,peon2.position.y,data.player.z)
                        });
                        posAnimation.setKeys(positionKeys);
                        peon2.animations.push(posAnimation);

                        globalScene.beginAnimation(peon2, 0, 15, false);
                    }else{
                        var posAnimation = new BABYLON.Animation("", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var positionKeys = [];
                        positionKeys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z)
                        });
                        positionKeys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(data.player.x,peon1.position.y,data.player.z)
                        });
                        posAnimation.setKeys(positionKeys);
                        peon1.animations.push(posAnimation);

                        globalScene.beginAnimation(peon1, 0, 15, false);
                    }
                }else if(data.wall.moved){
                    if(data.player.id == 2){
                        player[2].wall[data.wall.number].position.x = data.wall.x;
                        player[2].wall[data.wall.number].position.z = data.wall.z;
                        if(data.wall.rotated){
                            player[2].wall[data.wall.number].scaling.z = 4.9;
                            player[2].wall[data.wall.number].scaling.x = 0.9;
                        }else{
                            player[2].wall[data.wall.number].scaling.z = 0.9;
                            player[2].wall[data.wall.number].scaling.x = 4.9;
                        }
                    }else{
                        player[1].wall[data.wall.number].position.x = data.wall.x;
                        player[1].wall[data.wall.number].position.z = data.wall.z;
                        if(data.wall.rotated){
                            player[1].wall[data.wall.number].scaling.z = 4.9;
                            player[1].wall[data.wall.number].scaling.x = 0.9;
                        }else{
                            player[1].wall[data.wall.number].scaling.z = 0.9;
                            player[1].wall[data.wall.number].scaling.x = 4.9;
                        }
                    }
                }
            });
        });
    }, function (progress) {
        // To do: give progress feedback to user
    });
}

function setSkyBox(){
    skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, globalScene);
    skyboxMaterial = new BABYLON.StandardMaterial("skyBox", globalScene);
    skyboxMaterial.backFaceCulling = false;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/skybox/EBEN", globalScene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
}

function updateRooms(){
    socket.emit('update rooms');
}
function joinRoom(room){
    if(!inRoom) {
        inRoom = 1;
        var getRoom = {
            "id": room,
            "username": username
        };
        socket.emit('join room', getRoom);
    }
}
function leaveRoom(room,player){
    var data = {
        "id":room,
        "playerNo":player,
        "name":username
    };
    turn = 0;
    playerNo = 0;
    movedPlayer = 0;
    movedWall = 0;
    wallRotated = 0;
    locked.down = 0;
    locked.left = 0;
    locked.right = 0;
    locked.up = 0;
    inRoom = 0;
    disposeWalls();
    gameOn = 0;
    peon1.position.x = 15;
    peon2.position.x = -15;
    peon1.position.z = 0;
    peon2.position.z = 0;
    socket.emit('leave room', data);
    socket.emit('update player list', currentRoom);
    currentRoom = 0;
    clearPlayerList();
    updateInt = setInterval(updateRooms,500);
}

$(document).ready(function(){

});

$(window).unload(function(){
    leaveRoom(currentRoom,playerNo);
});

$(window).bind('beforeunload', function(){
    return 'Are you sure you want to leave? \n Leaving will end the game...';
});

$(window).resize(function(){
    engine.resize();
    fixUI();
});

function fixUI(){
    var height = $('#renderCanvas').height();
    var width = $('#renderCanvas').width();

    $('#playerlist').offset({left:10,top:height - 230});
    $('#tutorialButton').offset({left:width - 120,top:height - 70});
    $('#roomlist').offset({left:20,top:150});
}

function getUsername(){
    username = prompt("Welcome to Online Quoridor! \n Please enter a username...","Username");
    if(username == "" || username == null){
        getUsername();
    }
    connectionIp = prompt("Server Address: \n Leave empty for default public server. \n (Contact author for server files)", "https://quoridor-server.herokuapp.com/");
    if(connectionIp == "" || username == null){
        connectionIp = "https://quoridor-server.herokuapp.com/";
    }
}

function clearPlayerList(){
    $('#p1head').text('Player 1 : ');
    $('#p1body').text('No Player...');
    $('#p2head').text('Player 2 : ');
    $('#p2body').text('No Player...');
}

function endTurn(){
    if(!lock) {
        if (playerNo == 1) {
            if(pathClear(1) && pathClear(2)) {
                var data = {
                    "id": currentRoom,
                    "player": {
                        "id": playerNo,
                        "moved": movedPlayer,
                        "x": peon1.position.x,
                        "z": peon1.position.z
                    },
                    "wall": {
                        "number": currentWall,
                        "moved": movedWall,
                        "x": (currentWall<1) ? 0 : player[1].wall[currentWall].position.x,
                        "z": (currentWall<1) ? 0 : player[1].wall[currentWall].position.z,
                        "rotated": wallRotated
                    }
                };
                socket.emit("change turn", data);
            }else{
                alert('Please do not block players\' path with your wall.');
            }
        } else {
            if(pathClear(1) && pathClear(2)) {
                var data = {
                    "id": currentRoom,
                    "player": {
                        "id": playerNo,
                        "moved": movedPlayer,
                        "x": peon2.position.x,
                        "z": peon2.position.z
                    },
                    "wall": {
                        "number": currentWall,
                        "moved": movedWall,
                        "x": (currentWall<1) ? 0 : player[2].wall[currentWall].position.x,
                        "z": (currentWall<1) ? 0 : player[2].wall[currentWall].position.z,
                        "rotated": wallRotated
                    }
                };
                socket.emit("change turn", data);
            }else{
                alert('Please do not block players\' path with your wall.');
            }
        }
        if(pathClear(1) && pathClear(2)) {
            movedPlayer = 0;
            movedWall = 0;
            locked.down = 0;
            locked.left = 0;
            locked.right = 0;
            locked.up = 0;
        }
    }else{
        setTimeout(endTurn,500);
    }
}

function adjustCamKeys(){
    var c = globalScene.activeCamera;
    c.keysUp = [84]; // t
    c.keysLeft = [70]; // f
    c.keysDown = [71]; // g
    c.keysRight = [72]; // h
}

function move(e){
    if(playerNo==1) {
        if (turn == playerNo && gameOn && !lock) {
            switch (e.keyCode) {
                case 37:
                    if(!locked.left) {
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z-3)
                        });
                        animationBox.setKeys(keys);
                        peon1.animations.push(animationBox);
                        globalScene.beginAnimation(peon1, 0, 15, false);
                        //peon1.position.z -= 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.up = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(1);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 38:
                    if(!locked.up){
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon1.position.x-3,peon1.position.y,peon1.position.z)
                        });
                        animationBox.setKeys(keys);
                        peon1.animations.push(animationBox);
                        globalScene.beginAnimation(peon1, 0, 15, false);
                        //peon1.position.x -= 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.right = 1;
                            locked.up = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(1);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 39:
                    if(!locked.right) {
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z+3)
                        });
                        animationBox.setKeys(keys);
                        peon1.animations.push(animationBox);
                        globalScene.beginAnimation(peon1, 0, 15, false);
                        //peon1.position.z += 3;
                        if(!movedPlayer) {
                            locked.right = 1;
                            locked.up = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(1);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 40:
                    if(!locked.down){
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon1.position.x,peon1.position.y,peon1.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon1.position.x+3,peon1.position.y,peon1.position.z)
                        });
                        animationBox.setKeys(keys);
                        peon1.animations.push(animationBox);
                        globalScene.beginAnimation(peon1, 0, 15, false);
                        //peon1.position.x += 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.right = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(1);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 65://a
                    if(currentWall > 0) {
                        player[1].wall[currentWall].position.z -= 3;
                        movedWall = 1;
                        if (movedPlayer == 1) {
                            movedPlayer = 0;
                            fixPlayer();
                        }
                        break;
                    }
                case 87://w
                    if(currentWall > 0) {
                        player[1].wall[currentWall].position.x -= 3;
                        movedWall = 1;
                        if (movedPlayer == 1) {
                            movedPlayer = 0;
                            fixPlayer();
                        }
                        break;
                    }
                case 68://d
                    if(currentWall > 0) {
                        player[1].wall[currentWall].position.z += 3;
                        movedWall = 1;
                        if (movedPlayer == 1) {
                            movedPlayer = 0;
                            fixPlayer();
                        }
                        break;
                    }
                case 83://s
                    if(currentWall > 0) {
                        player[1].wall[currentWall].position.x += 3;
                        movedWall = 1;
                        if (movedPlayer == 1) {
                            movedPlayer = 0;
                            fixPlayer();
                        }
                        break;
                    }
                case 82://r
                    if(currentWall > 0) {
                        if (!wallRotated) {
                            player[1].wall[currentWall].scaling.z = 4.9;
                            player[1].wall[currentWall].scaling.x = 0.9;
                            wallRotated = 1;
                        } else {
                            player[1].wall[currentWall].scaling.z = 0.9;
                            player[1].wall[currentWall].scaling.x = 4.9;
                            wallRotated = 0;
                        }
                        break;
                    }
            }
        }
    }else{
        if (turn == playerNo && gameOn  && !lock) {
            switch (e.keyCode) {
                case 37:
                    if(!locked.left) {
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z+3)
                        });
                        animationBox.setKeys(keys);
                        peon2.animations.push(animationBox);
                        globalScene.beginAnimation(peon2, 0, 15, false);
                        //peon2.position.z += 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.up = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(2);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 38:
                    if(!locked.up){
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon2.position.x+3,peon2.position.y,peon2.position.z)
                        });
                        animationBox.setKeys(keys);
                        peon2.animations.push(animationBox);
                        globalScene.beginAnimation(peon2, 0, 15, false);
                        //peon2.position.x += 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.right = 1;
                            locked.up = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(2);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 39:
                    if(!locked.right) {
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z-3)
                        });
                        animationBox.setKeys(keys);
                        peon2.animations.push(animationBox);
                        globalScene.beginAnimation(peon2, 0, 15, false);
                        //peon2.position.z -= 3;
                        if(!movedPlayer) {
                            locked.right = 1;
                            locked.up = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(2);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 40:
                    if(!locked.down){
                        var animationBox = new BABYLON.Animation("myAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        var keys = [];
                        keys.push({
                            frame: 0,
                            value: new BABYLON.Vector3(peon2.position.x,peon2.position.y,peon2.position.z)
                        });
                        keys.push({
                            frame: 15,
                            value: new BABYLON.Vector3(peon2.position.x-3,peon2.position.y,peon2.position.z)
                        });
                        animationBox.setKeys(keys);
                        peon2.animations.push(animationBox);
                        globalScene.beginAnimation(peon2, 0, 15, false);
                        //peon2.position.x -= 3;
                        if(!movedPlayer) {
                            locked.left = 1;
                            locked.right = 1;
                            locked.down = 1;
                            movedPlayer = 1;
                            if(movedWall==1){
                                movedWall = 0;
                                fixWall(2);
                            }
                        }else{
                            locked.left = 0;
                            locked.up = 0;
                            locked.down = 0;
                            locked.right = 0;
                            movedPlayer = 0;
                        }
                        lock = 1;
                        setTimeout(closeLock,500);
                    }
                    break;
                case 65://a
                    player[2].wall[currentWall].position.z += 3;
                    if(movedPlayer==1){
                        movedPlayer = 0;
                        fixPlayer();
                    }
                    movedWall = 1;
                    break;
                case 87://w
                    player[2].wall[currentWall].position.x += 3;
                    movedWall = 1;
                    if(movedPlayer==1){
                        movedPlayer = 0;
                        fixPlayer();
                    }
                    break;
                case 68://d
                    player[2].wall[currentWall].position.z -= 3;
                    movedWall = 1;
                    if(movedPlayer==1){
                        movedPlayer = 0;
                        fixPlayer();
                    }
                    break;
                case 83://s
                    player[2].wall[currentWall].position.x -= 3;
                    movedWall = 1;
                    if(movedPlayer==1){
                        movedPlayer = 0;
                        fixPlayer();
                    }
                    break;
                case 82://r
                    if(!wallRotated) {
                        player[2].wall[currentWall].scaling.z = 4.9;
                        player[2].wall[currentWall].scaling.x = 0.9;
                        wallRotated = 1;
                    }else{
                        player[2].wall[currentWall].scaling.z = 0.9;
                        player[2].wall[currentWall].scaling.x = 4.9;
                        wallRotated = 0;
                    }
                    break;
            }
        }
    }
}

function fixPlayer() {
    if (playerNo == 1) {
        peon1.position.x = player1TempX;
        peon1.position.z = player1TempZ;
    }else {
        peon2.position.x = player2TempX;
        peon2.position.z = player2TempZ;
    }
    locked.down = 0;
    locked.up = 0;
    locked.left = 0;
    locked.right = 0;
}

function fixWall(no){
    if(no==1) {
        player[1].wall[currentWall].position.x = player1WallX;
        player[1].wall[currentWall].position.z = player1WallZ;
        player[1].wall[currentWall].scaling.z = 1;
        player[1].wall[currentWall].scaling.x = 5;
    }else{
        player[2].wall[currentWall].position.x = player2WallX;
        player[2].wall[currentWall].position.z = player2WallZ;
        player[2].wall[currentWall].scaling.z = 1;
        player[2].wall[currentWall].scaling.x = 5;
    }
    wallRotated = 0;
}

function closeLock(){
    lock = 0;
}

function resetRoom(room){
    switch (room) {
        case 0:
            socket.emit('reset room', 1);
            socket.emit('reset room', 2);
            socket.emit('reset room', 3);
            socket.emit('reset room', 4);
            socket.emit('reset room', 5);
            break;
        case 1:
            socket.emit('reset room', 1);
            break;
        case 2:
            socket.emit('reset room', 2);
            break;
        case 3:
            socket.emit('reset room', 3);
            break;
        case 4:
            socket.emit('reset room', 4);
            break;
        case 5:
            socket.emit('reset room', 5);
            break;
    }
}

function checkCollisions(){
    if(playerNo == 1) {
        for (var p = 2; p > 0; p--) {
            for (var i = 10; i > 1; i--) {
                if (peon1.intersectsMesh(player[p].wall[i],false)|| peon1.intersectsMesh(peon2,false)) {
                    globalScene.getAnimatableByTarget(peon1).stop();
                    movedPlayer = 0;
                    fixPlayer();
                    lock = 0;
                }
            }
        }
    }else{
        for (var p = 2; p > 0; p--) {
            for (var i = 10; i > 1; i--) {
                if (peon2.intersectsMesh(player[p].wall[i],false)|| peon2.intersectsMesh(peon1,false)) {
                    globalScene.getAnimatableByTarget(peon2).stop();
                    movedPlayer = 0;
                    fixPlayer();
                    lock = 0;
                }
            }
        }
    }
    for (var i = 10; i > 1; i--) {
        if (player[1].wall[i].position.x == -13.5){
            movedWall = 0;
            fixWall(1);
        }
        if (player[2].wall[i].position.x == 13.5){
            movedWall = 0;
            fixWall(2);
        }
    }
    if(peon1.position.x == -15) {
        endTurn();
        alert("Player 1 Wins!\nPress OK to leave the room...");
        leaveRoom(currentRoom, playerNo);
    }
    if(peon2.position.x == 15) {
        endTurn();
        alert("Player 2 Wins!\nPress OK to leave the room...");
        leaveRoom(currentRoom, playerNo);
    }
}

function setRoomUI(){
    $('#roomlist').html('<div class="btn-group"><button type="button" class="btn btn-default dropdown-toggle" style="opacity:0.7" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Room '+currentRoom+'<span class="caret"></span></button>'+
        '<ul class="dropdown-menu" style="cursor:pointer">'+
        '<li><a onclick="leaveRoom(currentRoom,playerNo);">Leave Room</a></li>'+
        '</ul>'+
        '</div>');
}