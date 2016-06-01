var expect = require("chai").expect;
var HazelcastClient = require("../.").Client;
var Controller = require('./RC');
var Util = require('./Util');

describe("Set Proxy", function () {

    var cluster;
    var client;
    var setInstance;

    before(function () {
        this.timeout(10000);
        return Controller.createCluster().then(function (response) {
            cluster = response;
            return Controller.startMember(cluster.id);
        }).then(function () {
            return HazelcastClient.newHazelcastClient().then(function (hazelcastClient) {
                client = hazelcastClient;
            });
        });
    });

    beforeEach(function () {
        setInstance = client.getSet('test')
    });

    afterEach(function () {
        return setInstance.destroy();
    });

    after(function () {
        client.shutdown();
        return Controller.shutdownCluster(cluster.id);
    });


    it("adds one item", function () {
        return setInstance.add(1).then(function () {
            return setInstance.size().then(function (size) {
                expect(size).to.equal(1);
            });
        })
    });

    it("adds all", function () {
        return setInstance.addAll([1, 2, 3]).then(function () {
            return setInstance.size().then(function (size) {
                expect(size).to.equal(3);
            });
        });
    });

    it("gets all", function () {
        var input = [1, 2, 3];
        return setInstance.addAll(input).then(function () {
            return setInstance.getAll().then(function (all) {
                expect(all.sort()).to.deep.equal(input);
            });
        });
    });

    it("contains", function () {
        var input = [1, 2, 3];
        return setInstance.addAll(input).then(function () {
            return setInstance.contains(1).then(function (contains) {
                expect(contains).to.be.true;
            });
        }).then(function () {
            return setInstance.contains(5).then(function (contains) {
                expect(contains).to.be.false;
            });
        });
    });

    it("contains all", function () {
        return setInstance.addAll([1, 2, 3]).then(function () {
            return setInstance.containsAll([1, 2]).then(function (contains) {
                expect(contains).to.be.true;
            });
        }).then(function () {
            return setInstance.containsAll([3, 4]).then(function (contains) {
                expect(contains).to.be.false;
            });
        });
    });


    it("is empty", function () {
        return setInstance.isEmpty().then(function (empty) {
            expect(empty).to.be.true;
            return setInstance.add(1);
        }).then(function () {
            return setInstance.isEmpty().then(function (empty) {
                expect(empty).to.be.false;
            })
        })
    });

    it("removes an entry", function () {
        return setInstance.addAll([1, 2, 3]).then(function () {
            return setInstance.remove(1)
        }).then(function () {
            return setInstance.getAll().then(function (all) {
                expect(all.sort()).to.deep.equal([2, 3]);
            });
        });
    });

    it("removes multiple entries", function () {
        return setInstance.addAll([1, 2, 3, 4]).then(function () {
            return setInstance.removeAll([1, 2]);
        }).then(function () {
            return setInstance.getAll().then(function (all) {
                expect(all.sort()).to.deep.equal([3, 4]);
            });
        });
    });

    it("retains multiple entries", function () {
        return setInstance.addAll([1, 2, 3, 4]).then(function () {
            return setInstance.retainAll([1, 2]);
        }).then(function () {
            return setInstance.getAll().then(function (all) {
                expect(all.sort()).to.deep.equal([1, 2]);
            });
        });
    });

    it("listens for added entry", function (done) {
        this.timeout(5000);
        return setInstance.addItemListener({
            "itemAdded" : function (item) {
                if (item == 1) {
                    done()
                } else {
                    done(new Error("Expected 1, got " + item))
                }
            }
        }).then(function () {
            setInstance.add(1);
        })
    });

    it("listens for removed entry", function (done) {
        this.timeout(5000);
        return setInstance.addItemListener({
            "itemRemoved" : function (item) {
                if (item == 1) {
                    done()
                } else {
                    done(new Error("Expected 1, got " + item))
                }
            }
        }).then(function () {
            return setInstance.add(1);
        }).then(function () {
            return setInstance.remove(1);
        })
    });


    it("remove entry listener", function () {
        this.timeout(5000);
        return setInstance.addItemListener({
            "itemRemoved" : function (item) {
                if (item == 1) {
                    done()
                } else {
                    done(new Error("Expected 1, got " + item))
                }
            }
        }).then(function (registrationId) {
            return setInstance.removeItemListener(registrationId);
        }).then(function (removed) {
            expect(removed).to.be.true;
        })
    });


});