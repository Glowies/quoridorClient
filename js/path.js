function pathClear(playerNo) {
    if (playerNo == 1) {
        var order = [];
        var checkingPath = 1;
        order[0] = {
            "x": peon1.position.x,
            "z": peon1.position.z,
            "leftOpen": 1,
            "rightOpen": 1,
            "frontOpen": 1,
            "backOpen": 1
        };
        var x = 0;
        while (checkingPath == 1) {
            if (order[0].x == -15) {
                checkingPath = 0;
                return true;
            } else {
                //test for wall on front
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 0; i--) {
                        //console.log('trying out player ' + p + ' wall ' + i);
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x - 1.5, 0, order[0].z))) {
                            order[0].frontOpen = 0;
                        }
                    }
                }
                for (var i = 0; i < order.length; i++) {
                    var xCheck = order[0].x - 3;
                    var zCheck = order[0].z;
                    if (xCheck == order[i].x && zCheck == order[i].z) {
                        order[0].frontOpen = 0;
                        order[i].backOpen = 0;
                    }
                }

                //test for wall on right
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x, 0, order[0].z + 1.5))) {
                            order[0].rightOpen = 0;
                        }
                    }
                }
                if (order[0].z == 12 || order[0].x == 15) {
                    order[0].rightOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var zCheck = order[0].z + 3;
                    var xCheck = order[0].x;
                    if (zCheck == order[i].z && xCheck == order[i].x) {
                        order[0].rightOpen = 0;
                        order[i].leftOpen = 0;
                    }
                }

                //test for wall on back
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x + 1.5, 0, order[0].z))) {
                            order[0].backOpen = 0;
                        }
                    }
                }
                if (order[0].x == 12  || order[0].x == 15) {
                    order[0].backOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var xCheck = order[0].x + 3;
                    var zCheck = order[0].z;
                    if (xCheck == order[i].x && zCheck == order[i].z) {
                        order[0].backOpen = 0;
                        order[i].frontOpen = 0;
                    }
                }

                //test for wall on left
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x, 0, order[0].z - 1.5))) {
                            order[0].leftOpen = 0;
                        }
                    }
                }
                if (order[0].z == -12 || order[0].x == 15) {
                    order[0].leftOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var zCheck = order[0].z - 3;
                    var xCheck = order[0].x;
                    if (zCheck == order[i].z && xCheck == order[i].x) {
                        order[0].leftOpen = 0;
                        order[i].rightOpen = 0;
                    }
                }

                if (order[0].frontOpen) {
                    var derp = {
                        "x": order[0].x - 3,
                        "z": order[0].z,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].frontOpen = 0;
                    order.splice(0, 0, derp);//push new order to check
                } else if (order[0].rightOpen) {
                    var derp = {
                        "x": order[0].x,
                        "z": order[0].z + 3,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].rightOpen = 0;
                    order.splice(0, 0, derp);
                } else if (order[0].backOpen) {
                    var derp = {
                        "x": order[0].x + 3,
                        "z": order[0].z,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].backOpen = 0;
                    order.splice(0, 0, derp);
                } else if (order[0].leftOpen) {
                    var derp = {
                        "x": order[0].x,
                        "z": order[0].z - 3,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].leftOpen = 0;
                    order.splice(0, 0, derp);
                } else {
                    if (typeof order[1] !== 'undefined') {
                        order.splice(0, 1);
                    } else {
                        checkingPath = 0;
                        return false;
                    }
                }
                x++;
                if (x == 10000) {
                    checkingPath = 0;
                    return false;
                }
            }
        }
    } else {//PLAYER TWO
        var order = [];
        var checkingPath = 1;
        order[0] = {
            "x": peon2.position.x,
            "z": peon2.position.z,
            "leftOpen": 1,
            "rightOpen": 1,
            "frontOpen": 1,
            "backOpen": 1
        };
        var x = 0;
        while (checkingPath == 1) {
            if (order[0].x == 15) {
                checkingPath = 0;
                return true;
            } else {
                //test for wall on front
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 0; i--) {
                        //console.log('trying out player ' + p + ' wall ' + i);
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x + 1.5, 0, order[0].z))) {
                            order[0].frontOpen = 0;
                        }
                    }
                }
                for (var i = 0; i < order.length; i++) {
                    var xCheck = order[0].x + 3;
                    var zCheck = order[0].z;
                    if (xCheck == order[i].x && zCheck == order[i].z) {
                        order[0].frontOpen = 0;
                        order[i].backOpen = 0;
                    }
                }

                //test for wall on right
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x, 0, order[0].z - 1.5))) {
                            order[0].rightOpen = 0;
                        }
                    }
                }
                if (order[0].z == -12 || order[0].x == -15) {
                    order[0].rightOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var zCheck = order[0].z - 3;
                    var xCheck = order[0].x;
                    if (zCheck == order[i].z && xCheck == order[i].x) {
                        order[0].rightOpen = 0;
                        order[i].leftOpen = 0;
                    }
                }

                //test for wall on back
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x - 1.5, 0, order[0].z))) {
                            order[0].backOpen = 0;
                        }
                    }
                }
                if (order[0].x == -12 || order[0].x == -15) {
                    order[0].backOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var xCheck = order[0].x - 3;
                    var zCheck = order[0].z;
                    if (xCheck == order[i].x && zCheck == order[i].z) {
                        order[0].backOpen = 0;
                        order[i].frontOpen = 0;
                    }
                }

                //test for wall on left
                for (var p = 2; p > 0; p--) {
                    for (var i = 10; i > 1; i--) {
                        if (player[p].wall[i].intersectsPoint(new BABYLON.Vector3(order[0].x, 0, order[0].z + 1.5))) {
                            order[0].leftOpen = 0;
                        }
                    }
                }
                if (order[0].z == 12 || order[0].x == -15) {
                    order[0].leftOpen = 0;
                }
                for (var i = 0; i < order.length; i++) {
                    var zCheck = order[0].z + 3;
                    var xCheck = order[0].x;
                    if (zCheck == order[i].z && xCheck == order[i].x) {
                        order[0].leftOpen = 0;
                        order[i].rightOpen = 0;
                    }
                }
                if (order[0].frontOpen) {
                    var derp = {
                        "x": order[0].x + 3,
                        "z": order[0].z,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].frontOpen = 0;
                    order.splice(0, 0, derp);//push new order to check
                } else if (order[0].rightOpen) {
                    var derp = {
                        "x": order[0].x,
                        "z": order[0].z - 3,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].rightOpen = 0;
                    order.splice(0, 0, derp);
                } else if (order[0].backOpen) {
                    var derp = {
                        "x": order[0].x - 3,
                        "z": order[0].z,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].backOpen = 0;
                    order.splice(0, 0, derp);
                } else if (order[0].leftOpen) {
                    var derp = {
                        "x": order[0].x,
                        "z": order[0].z + 3,
                        "leftOpen": 1,
                        "rightOpen": 1,
                        "frontOpen": 1,
                        "backOpen": 1
                    };
                    order[0].leftOpen = 0;
                    order.splice(0, 0, derp);
                } else {
                    if (typeof order[1] !== 'undefined') {
                        order.splice(0, 1);
                    } else {
                        checkingPath = 0;
                        return false;
                    }
                }
                x++;
                if (x == 10000) {
                    checkingPath = 0;
                    return false;
                }
            }
        }
    }
}